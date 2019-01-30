const db = require('./db');

function executeRoute(internal_function, request, response){
    handleConnection(internal_function, request)
    .then(result => sendResult(response, result))
    .catch(result => sendResult(response, result));
}

async function handleConnection(internal_function, request){
    const connection = await db.connectToDb();
    if (connection === null) return { code: '500', error: 'database connection error'}
    else{
        const result = internal_function(request);
        connection.end();
        return result;
    }
}

function sendResult(response, result){ 
    if (result.isError()) console.log(result);
    response.status(result.getCode()).send(result.getParams());
}

class Success{
    constructor(params=null){
        this.params = params;
    }

    getCode(){ return 200; }

    getParams(){ return this.params; }

    getParam(name){ return this.params[name]; }

    isError(){ return false; }
}

class Error{
    constructor(code, message, error=null){
        this.code = code;
        this.message = message;
        this.error = error;
    }

    getCode(){ return this.code; }

    getMessage(){ return this.message; }

    getError(){ return this.error; }

    isError(){ return true; }
}

class QueryResult{
    constructor(result){
        this.result = result;
    }

    getResult(){ return this.result; }

    isError(){ return false; }

    isEmpty(){ return this.result.length === 0; }
}

module.exports = { executeRoute, Success, Error, QueryResult }