const controller = require('./authController');
const { Error, Success } = require('../common');

function validateLogin(request){
    if (request.body.name == null || request.body.password == null) return new Error(400, 'validation error');
    else return new Success();
}

async function validateSignUp(connection, request){
    if (request.body.name == null || request.body.screen_name == null || request.body.password == null) return new Error(400, 'validation error');
    //check for length of password, name, ect

    const result = await controller.getUser(connection, request.body.name);
    if (result.isError()) return result;
    if (!result.isEmpty()) return new Error(400, 'validation error');
    return new Success();
}

module.exports = { validateLogin, validateSignUp }