const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./auth/authRoute');

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
app.listen(process.env.PORT || 3000, (error) =>{
    if (error) console.log('error');
    else console.log('running');
});

module.exports = app;