const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./auth/authRoute');
const groupRoutes = require('./group/groupRoute');
const chatRoutes = require('./chat/chatRoute');

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
app.use('/group', groupRoutes);
app.unsubscribe('/chat', chatRoutes);

const server = app.listen(8080, '0.0.0.0', (error) =>{
    if (error) console.log('error');
    else console.log('running');
});

module.exports = {app, server};
