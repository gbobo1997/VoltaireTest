const controller = require('./authController');

function validateLogin(request){
    return (request.body.name !== null && request.body.password !== null)
}

async function validateSignUp(connection, request){
    if (request.body.name === null || request.body.screen_name === null || request.body.password === null) return false;
    //check for length of password, name, ect

    const result = await controller.getUser(connection, request.body.name);
    return (!result || result.length === 0);
}

module.exports = { validateLogin, validateSignUp }