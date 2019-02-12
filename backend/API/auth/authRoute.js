const express = require('express');

const executeRoute = require('../route');
const {validateLogin, validateSignUp} = require('./authValidation');
const {login, signUp} = require('./authController');

const router = express.Router();

router.post('/login', (request, response) => executeRoute(request, response, login, validateLogin));
router.post('/sign-up', (request, response) => executeRoute(request, response, signUp, validateSignUp));

module.exports = router;