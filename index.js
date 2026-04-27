const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
// Adding middleware to parse application/json
app.use(express.json());

const axios = require('axios/dist/node/axios.cjs'); // node
// Inject env file
const dotenv = require('dotenv').config();
const bcrypt = require("bcrypt");
const saltRounds = 16;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const validator = require("validator");

const instance = axios.create({
  baseURL: "https://api.baserow.io",
  headers: {
    Authorization: `Token ${process.env.BASEROW_API_TOKEN}`
  }
})

app.use(cookieParser());

app.listen(port, () => {
    console.log(`Express app listening on port: ${port}`);
})

app.get('/users', (req, res) => {
    // Testing fetching users
    const cookieToken = req.cookies.token;
    if(!cookieToken) return res.sendStatus(401);

    // Validate cookie
    const decoded = jwt.verify(cookieToken, process.env.AUTH_SECRET);
    if(decoded) {
        instance({
            url:"api/database/fields/table/941203/?user_field_names=true",
            method: 'get'
        }).then((response) => {
            return res.send(response.data);
        })
    } else {
        return res.sendStatus(401);
    }
})

app.get('/user', (req, res) => {
    // Testing fetching user
    const cookieToken = req.cookies.token;
    if(!cookieToken) return res.sendStatus(401);

    // Validate cookie
    const decoded = jwt.verify(cookieToken, process.env.AUTH_SECRET);

    if(decoded) {
        instance({
            url:"api/database/rows/table/941203/1/",
            method: 'get'
        }).then((response) => {
            return res.send(response.data);
        })
    } else {
        return res.sendStatus(401);
    }
})

app.post('/register', async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    if(
        !req.body.Password ||
        !req.body.Email ||
        !req.body.Name
    ) {
        return res.sendStatus(400);
    }
    // Sanitize the input before proceeding as well
    const email = req.body.Email;
    const password = req.body.Password;
    const validEmail = validator.isEmail(email);

    if(!validEmail) {
        return res.status(400).json({
            message: "Invalid email address"
        })
    }

    const normalizedEmail = validator.normalizeEmail(email).toLocaleLowerCase();

    // Check there isn't already an account with this email
    const query = await instance({
        url:`api/database/rows/table/941203/?user_field_names=true&&filter__Email__equal=${normalizedEmail}`,
        method: 'get'
    })

    if(query?.data?.results && query.data.results.length) {
        return res.status(400).json({
            message: "An account with this email already exists"
        })
    } else {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                // Posting to create a new user
                instance({
                    url: "api/database/rows/table/941203/?user_field_names=true",
                    method: 'post',
                    data: {
                        "Name": req.body.Name,
                        "Email": normalizedEmail,
                        "Role": 5956549,
                        "Password": hash
                    }
                }).then((response) => {
                    if(response.data) {
                        return res.sendStatus(200);
                    } else {
                        return res.sendStatus(400);
                    }
                })
            });
        });
    }

})

app.post('/authenticate', async (req, res) => {
    // Check to make sure the body has email and password
    if (!req.body.Password || !req.body.Email) return res.sendStatus(400);

    // We should sanitize the password and email as well first
    const password = req.body.Password;
    const email = req.body.Email;

    const validEmail = validator.isEmail(email);
    if(!validEmail) {
        return res.status(400).json({
            message: "Invalid email address"
        });
    }

    const normalizedEmail = validator.normalizeEmail(email).toLocaleLowerCase();

    const query = await instance({
        url:`api/database/rows/table/941203/?user_field_names=true&&filter__Email__equal=${normalizedEmail}`,
        method: 'get'
    })

    if(query?.data?.results && query.data.results.length) {
        const user = query.data.results[0];
        const result = await bcrypt.compare(password, user.Password);

        if(result) {
            const accessToken = jwt.sign(
                {
                    data: { id: user.id},
                },
                process.env.AUTH_SECRET,
                { expiresIn: process.env.AUTH_SECRET_EXPIRES_IN }
            );

            res.cookie('token', accessToken, {
                httpOnly: true,  // Prevents JS access (XSS protection)
                secure: true,    // Send only over HTTPS
                sameSite: 'Lax', // Protects against some CSRF
                maxAge: process.env.AUTH_SECRET_EXPIRES_IN  // 1 hour in milliseconds
            });

            return res.status(200).json(
                {
                    id: user.id,
                    token: accessToken,
                }
            );
        } else {
            return res.sendStatus(401);
        }
    }
})