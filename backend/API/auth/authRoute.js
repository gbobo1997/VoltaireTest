const express = require('express');

const { executeRoute, Success } = require('../common');
const validation = require('./authValidation');
const controller = require('./authController');

const router = express.Router();

router.post('/login', (request, response) => executeRoute(login, request, response));
router.post('/sign-up', (request, response) => executeRoute(signUp, request, response));

async function login(request){
    const valid = validation.validateLogin(request);
    if (valid.isError()) return valid;

    const verify = await controller.verifyPassword(connection, request.body.name, request.body.password);
    if (verify.isError()) return verify;

    return controller.createToken(verify.getParam('id'));
}

async function signUp(request){
    const valid = await validation.validateSignUp(connection, request);
    if (valid.isError()) return valid;

    return await controller.signUp(connection, request.body.name, request.body.screen_name, request.body.password);
}

module.exports = router;