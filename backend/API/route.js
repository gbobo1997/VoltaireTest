const db = require('./db');
const update = require('./update/updateController')


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
    if (valid.isError()){
        connection.end();
        return valid;
    } 

    const result = await controller(request.body, connection);
    if (result.isError() || request.body.user_id == null){
        connection.end();
        return result;
    }

    const updates = await update.getUserUpdates(request.body.user_id, connection);
    if (updates.isError()){
        connection.end()
        return updates;
    }
    result.getParams().updates = updates.getParams();

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
