const express = require('express');
const bodyParser = require('body-parser');

const authRoutes = require('./code/auth/authRoute');

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested_With, Content_Type, Accept, Authorization');
    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/auth', authRoutes);

module.exports = app;