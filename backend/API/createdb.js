var db = require('./db');

async function createDb(){
    const conn_res = await db.connectToDb();
    if (conn_res.isError()) return conn_res;

    const connection = conn_res.getParam('connection');

    const query = createDbQuery();
    const result = await db.queryDb(connection, query);
    return result;
    
}


function createDbQuery(){
    return `CREATE TABLE IF NOT EXISTS Users (
        UserID int NOT NULL AUTO_INCREMENT,
        UserName varchar(32) NOT NULL,
        ScreenName varchar(32) NOT NULL,
        Password varchar(64) NOT NULL,
        PRIMARY KEY (UserID)
    );
    CREATE TABLE IF NOT EXISTS ChatGroup ( 
        GroupID int NOT NULL AUTO_INCREMENT, 
        GroupName varchar(64) NOT NULL, 
        PRIMARY KEY (GroupID) 
    );
    CREATE TABLE IF NOT EXISTS GroupMembers (
        GroupID int NOT NULL,
        UserID int NOT NULL,
        PRIMARY KEY(GroupID, UserID),
        FOREIGN KEY(GroupID) REFERENCES ChatGroup(GroupID),
        FOREIGN KEY(UserID) REFERENCES Users(UserID)
    )`;
}

createDb()
    .then(result => {
        if (result.isError()) console.log(result);
        else console.log('database created')
    })
    .catch(error => console.log(error));