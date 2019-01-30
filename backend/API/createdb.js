var db = require('./db');

async function createDb(){
    const connection = await db.connectToDb();
    const query = createDbQuery();
    return result = await db.queryDb(connection, query);
}


function createDbQuery(){
    return `CREATE TABLE Users (
        UserID int NOT NULL AUTO_INCREMENT,
        UserName varchar(32) NOT NULL,
        Password varchar(64) NOT NULL,
        PRIMARY KEY (UserID)
    )`;
}

createDb()
    .then(result => console.log('database created'))
    .catch(error => console.log(error));