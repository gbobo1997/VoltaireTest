function validateLogin(request){
    return (request.body.name !== null && request.body.password !== null)
}

module.exports = { validateLogin }