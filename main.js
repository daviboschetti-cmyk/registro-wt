const express = require('express');
const authRoute = require('./rotes/auth.rout.js');
const path = require('path');
const cors = require('cors');

const APP = express();


APP.use(cors());


APP.use(express.static(path.join(__dirname, 'front-end')));


APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));


APP.use(authRoute);

APP.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-end', 'index.html'));
});

const PORT = 3000;
const SERVER = "http://localhost";
const MSG = `Servidor Online em ${SERVER}:${PORT}`;

APP.listen(PORT, () => console.log(MSG));