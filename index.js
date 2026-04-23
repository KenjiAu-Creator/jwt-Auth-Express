const express = require('express');
const app = express();
const port = 3000;
// Adding middleware to parse application/json
app.use(express.json());

const axios = require('axios/dist/node/axios.cjs'); // node
// Inject env file
const dotenv = require('dotenv').config();
const bcrypt = require("bcrypt");
const saltRounds = 16;
const jwt = require('jsonwebtoken');

const instance = axios.create({
  baseURL: "https://api.baserow.io",
  headers: {
    Authorization: `Token ${process.env.BASEROW_API_TOKEN}`
  }
})

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/users', (req, res) => {
    // Testing fetching users
    instance({
        url:"api/database/fields/table/941203/?user_field_names=true",
        method: 'get'
    }).then(function (response) {
        res.send(response.data);
    })
})

app.get('/user', (req, res) => {
    // Testing fetching user
    instance({
        url:"api/database/rows/table/941203/1/",
        method: 'get'
    }).then(function (response) {
        res.send(response.data);
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port: ${port}`);
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

    const password = req.body.Password;

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            // Posting to create a new user
            instance({
                url: "api/database/rows/table/941203/?user_field_names=true",
                method: 'post',
                data: {
                    "Name": req.body.Name,
                    "Email": req.body.Email,
                    "Role": 5956549,
                    "Password": hash
                }
            }).then(function (response) {
                if(response.data) {
                    return res.sendStatus(200);
                } else {
                    return res.sendStatus(400);
                }
            })
        });
    });
})

app.post('/authenticate', async (req, res) => {
    // Check to make sure the body has email and password
    if (!req.body) return res.sendStatus(400);

    const password = req.body.Password;

    const query = await instance({
        url:`api/database/rows/table/941203/?user_field_names=true&&filter__Email__equal=${req.body.Email}`,
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