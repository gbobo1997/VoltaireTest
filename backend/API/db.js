const mysql = require('mysql');
const { QueryResult, Error } = require('./common');

async function connectToDb(){
    const {DB_USER, DB_PASS, DB_NAME, SOCKET, DB_TYPE } = process.env; 

    const db_options = { user:'root', host: 'localhost', database:'BACS', multipleStatements: true }
    if (DB_TYPE === 'Production') db_options.socketPath = SOCKET;

    const connection = mysql.createConnection(db_options);
    connection.connect((error) =>{
        if (error){
            console.log(error);
            return null;
        }
        else return connection;
    })
}

async function queryDb(connection, query, values=[]){
    connection.query(query, values, (error, result) =>{
        if (error) return new Error(500, 'database error', error);
        else return new QueryResult(result);
    });
}

module.exports = {
    connectToDb : connectToDb,
    queryDb : queryDb
}