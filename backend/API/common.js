class Success{
    constructor(params={}){
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

    getParams(){
        return {
            message : this.message,
            error : this.error
        }
    }

    isError(){ return true; }
}

class QueryResult{
    constructor(result){
        this.result = result;
    }

    getData(){ return this.result; }

    getDataValue(attribute, index=0){
        if (this.result == null || index < 0 || index >= this.result.length){
            console.log('could not get '+attribute+'of item '+index+' from '+this.result);
            return null;
        }
        return this.result[index][attribute];
    }

    getAddedRowId(){
        if (this.result == null || this.result.insertId == null){
            console.log('there was no insertId for this query');
            return null;
        }
        return this.result.insertId;
    }

    isError(){ return false; }

    isEmpty(){ return this.result.length === 0; }
}

module.exports = {Success, Error, QueryResult}