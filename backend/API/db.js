const mysql = require('mysql');

async function connectToDb(){
    const {DB_USER, DB_PASS, DB_NAME, SOCKET, DB_TYPE } = process.env; 

    const db_options = { user:'root', host: 'localhost', database:'BACS', multipleStatements: true }
    if (DB_TYPE === 'Production') db_options.socketPath = SOCKET;

    const connection = mysql.createConnection(db_options);
    
    return new Promise((resolve, reject) => {
        connection.connect((error) =>{
            if (error) reject({code : '500', error : error});
            else resolve(connection);
        })
    });
}

async function queryDb(connection, query, values=[]){
    return new Promise((resolve, reject) =>{
        connection.query(query, values, (error, result) =>{
            if (error) reject({code : '500', error : error});
            else resolve(result);
        });
    });
}

module.exports = {
    connectToDb : connectToDb,
    queryDb : queryDb
}