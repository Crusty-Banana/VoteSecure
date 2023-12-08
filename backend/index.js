// Necessary Library
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

// Database
const db = require('./database/database');

// Service
const userService = require('./service/user');

// Authentication
const auth = require('./middleware/auth');

// Environment Constant
const { PORT } = process.env;


const app = express();

app.use(express.json());
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

db.connect();

app.listen(PORT, () => {
    console.log(`App is listening to port: ${PORT}`);
});

app.post('/register', userService.register);

app.post("/login", userService.login);

app.post("/auth-test", auth, (req, res) => {
    return res.status(234).send('authenticated!')
});
app.get('/', (request, response) => {
    console.log(request)
    return response.status(234).send('Backend main page')
});

