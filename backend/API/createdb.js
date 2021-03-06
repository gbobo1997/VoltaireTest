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
        PRIMARY KEY (GroupID, UserID),
        FOREIGN KEY (GroupID) REFERENCES ChatGroup(GroupID),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
    CREATE TABLE IF NOT EXISTS Chat ( 
        ChatID int NOT NULL AUTO_INCREMENT,
        ChatName varchar(32) NOT NULL,
        GroupID int NOT NULL,
        PRIMARY KEY (ChatID),
        FOREIGN KEY (GroupID) REFERENCES ChatGroup(GroupID)
    );
    CREATE TABLE IF NOT EXISTS Message (
        MessageID int NOT NULL AUTO_INCREMENT,
        UserID int NOT NULL,
        MessageContent TEXT NOT NULL,
        TimeSent bigint NOT NULL,
        ChatID int NOT NULL,
        PRIMARY KEY (MessageID),
        FOREIGN KEY (ChatID) REFERENCES Chat(ChatID)
    );
    CREATE TABLE IF NOT EXISTS File (
        FileID int NOT NULL AUTO_INCREMENT,
        GroupID int NOT NULL,
        FileName varchar(32) NOT NULL,
        FileContent text NOT NULL,
        PRIMARY KEY (FileID),
        FOREIGN KEY (GroupID) REFERENCES ChatGroup(GroupID)
    );
    CREATE TABLE IF NOT EXISTS FileLocks (
        FileID int NOT NULL,
        UserID int NOT NULL,
        Expires bigint NOT NULL,
        PRIMARY KEY (FileID),
        FOREIGN KEY (FileID) REFERENCES File(FileID),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
    CREATE TABLE IF NOT EXISTS UserUpdate (
        UpdateID int NOT NULL AUTO_INCREMENT,
        UserID int NOT NULL,
        UpdateType int NOT NULL,
        UpdateTime bigint NOT NULL,
        UpdateContent text NOT NULL,
        PRIMARY KEY (UpdateID),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
    CREATE TABLE IF NOT EXISTS GroupInvites (
        UserID int NOT NULL,
        GroupID int NOT NULL,
        SenderName varchar(32) NOT NULL,
        PRIMARY KEY (UserID, GroupID)
    )`;
}

createDb()
    .then(result => {
        if (result.isError()) console.log(result);
        else console.log('database created')
    })
    .catch(error => console.log(error));