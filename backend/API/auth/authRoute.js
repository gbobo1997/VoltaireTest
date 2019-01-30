const express = require('express');

const db = require('../db');
const validation = require('./authValidation');
const controller = require('./authController');

const router = express.Router();

router.post('/login', (request, response) =>{
    login(request)
        .then(result =>{
            const {code, ...values} = result;
            response.status(code).send(values);
        })
        .catch(result => response.status(result.code).send(result.error));
});

async function login(request){
    if (!validation.validateLogin(request)) return {code: '400', error: 'validation error'};

    const connection = await db.connectToDb();
    const id = await controller.verifyPassword(connection, request.body.name, request.body.password);
    if (id === null) return {code : '401', error : 'auth error'};

    const token = controller.createToken(id);
    return {code : '200', token : token};
}

module.exports = router;