const mysql = require('mysql');
const {Success, Error, QueryResult} = require('./common');

async function connectToDb(){
    return new Promise((resolve) =>{
        const db_options = { user:'root', host: 'localhost', database:'BACS', multipleStatements: true }
    
        const connection = mysql.createConnection(db_options);
        connection.connect((error) =>{
            if (error) resolve(new Error(500, 'connection error', error));
            else{ resolve(new Success({connection})); }
        });
    });
}

async function queryDb(connection, query, values=[]){
    return new Promise((resolve) =>{
        connection.query(query, values, (error, result) =>{
            if (error) resolve(new Error(500, 'database error', error));
            else resolve(new QueryResult(result));
        });
    });
}

module.exports = {
    connectToDb : connectToDb,
    queryDb : queryDb
}