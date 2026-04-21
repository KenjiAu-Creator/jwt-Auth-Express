const express = require('express');
const app = express();
const port = 3000;

const axios = require('axios/dist/node/axios.cjs'); // node
// Inject env file
const dotenv = require('dotenv').config();

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

