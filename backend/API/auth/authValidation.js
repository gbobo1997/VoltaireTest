const controller = require('./authController');
const { Error, Success } = require('../common');

function validateLogin(body){
    if (body.name == null || body.password == null){
        return new Error(400, 'invalid parameters, send the following body: {name : string, password : string}');
    }
    else return new Success();
}

async function validateSignUp(body, connection){
    if (body.name == null || body.screen_name == null || body.password == null){
        return new Error(400, 'invalid parameters, send the following body: {name : string, screen_name : string, password : string}');
    } 

    const result = await controller.getUser(connection, body.name);
    if (result.isError()) return result;
    if (!result.isEmpty()) return new Error(400, 'user with the same name already exists');
    return new Success();
}

module.exports = { validateLogin, validateSignUp }