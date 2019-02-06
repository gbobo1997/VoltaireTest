const db = require('./db');


function executeRoute(request, response, controller, validator){
    handleConnection(request, controller, validator)
    .then(result => sendResult(response, result))
    .catch(error => sendError(response, error));
}

async function handleConnection(request, controller, validator){
    const conn_res = await db.connectToDb();
    if (conn_res.isError()) return conn_res;

    const connection = conn_res.getParam('connection');

    const valid = await validator(request.body, connection);
    if (valid.isError()) return valid;

    const result = await controller(request.body, connection);
    connection.end();
    return result;
}

function sendResult(response, result){ 
    response.status(result.getCode()).send(result.getParams());
}

function sendError(response, error){
    console.log(error);
    response.status('500').send({error : 'there was an error'});
}

module.exports = executeRoute;
