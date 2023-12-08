// Necessary Library
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Database
const db = require('./database/database.js');

// Environment Constant
const { PORT } = process.env;


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

db.connect();

app.listen(PORT, () => {
    console.log(`App is listening to port: ${PORT}`);
})

app.get('/', (request, response) => {
    console.log(request)
    return response.status(234).send('Backend main page')
})

