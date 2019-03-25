const { queryDb } = require('../db');
const { Success, Error } = require('../common');

//tests
// -non-existent user (should return db error)
// -non-existent group (should return db error)
async function createFile(body, connection){
    const {group_id, file_name, file_content} = body;
    var query = 'INSERT INTO File (GroupID, FileName, FileContent) Values (?, ?, ?)';

    var result = await queryDb(connection, query, [group_id, file_name, file_content]);
    if (result.isError()) return result;
    else return new Success({file_id : result.getAddedRowId()});
}

async function deleteFile(body, connection){
    const { file_id } = body;
    var query = 'DELETE FROM FileLocks WHERE FileID = ?';

    var result = await queryDb(connection, query, file_id);
    if (result.isError()) return result;
    
    query = 'DELETE FROM File WHERE FileID = ?';
    var result = await queryDb(connection, query, file_id);
    if (result.isError()) return result;
    else return new Success();
}

async function getFileLock(body, connection){
    const { file_id } = body;
    var query = 'SELECT *, ScreenName FROM FileLocks INNER JOIN Users ON Users.UserID = FileLocks.UserID WHERE FileID = ?';

    var result = await queryDb(connection, query, file_id);
    if (result.isError()) return result;
    else return new Success(result.getData());
}

//tests
// -no existing lock
// -existing lock
// -expired lock
// -existing lock from requesting user

//need to push an update to the update table on success
async function requestFileLock(body, connection){
    const { user_id, file_id } = body;
    //check if there is currently a lock
    var query = 'SELECT UserID As user_id, Expires As expires FROM FileLocks WHERE FIleID = ?';
    const current_time = Date.now()

    var result = await queryDb(connection, query, file_id);
    console.log(result.getData());
    if (result.isError()) return result;
    //not sure about how timestamps are converted yet so this line might not work right
    //if the lock is owned by another person and is not expired, return an error
    if (!result.isEmpty() && result.getDataValue('user_id') !== user_id 
        && new Date(result.getDataValue('expires')) > current_time){
            return new Error(400, 'another user holds this lock until '+result.getDataValue('expires')); 
    }

    //add an hour to the current time and format it as YYYY-MM-DD HH:MM:SS
    const expired_time = current_time.getTime() + (60 * 60 * 1000);
    const formatted_time = new Date(expired_time).toISOString().replace(/T/, ' ').replace(/\..+/, '');

    query = 'INSERT INTO FileLocks (FileID, UserID, Expires) VALUES (?, ?, ?) '+
        'ON DUPLICATE KEY UPDATE UserID = ?, Expires = ?';
    
    result = await queryDb(connection, query, [file_id, user_id, formatted_time, user_id, formatted_time]);
    if (result.isError()) return result;
    else return new Success({expiration : formatted_time});
}

//need to push an update to the update table on success
async function removeFileLock(body, connection){
    const { file_id }= body;
    var query = 'DELETE FROM FileLocks WHERE FileID = ?';

    var result = await queryDb(connection, query, file_id);
    if (result.isError()) return result;
    else return new Success();
}

async function updateFile(body, connection){

}

async function getGroupFiles(body, connection){

}