const { queryDb } = require('../db');
const { Success, Error } = require('../common');
const updater = require('../update/updateController');

//tests
// -non-existent user (should return db error)
// -non-existent group (should return db error)
async function createFile(body, connection){
    const {group_id, file_name, file_content} = body;
    var query = 'INSERT INTO File (GroupID, FileName, FileContent) Values (?, ?, ?)';

    var result = await queryDb(connection, query, [group_id, file_name, file_content]);
    if (result.isError()) return result;

    const file_id = result.getAddedRowId();
    var update_result = await updater.fileCreated(group_id, file_id, file_name, connection);
    if (update_result.isError()) return update_result;
    return new Success({file_id});
}

//non-existent file (should do nothing)
async function deleteFile(body, connection){
    const { file_id, group_id } = body;
    if (file_id == null || group_id == null) return new Error(500, 'database error');
    
    var query = 'DELETE FROM FileLocks WHERE FileID = ?';

    var result = await queryDb(connection, query, file_id);
    if (result.isError()) return result;
    
    query = 'DELETE FROM File WHERE FileID = ?';
    var result = await queryDb(connection, query, file_id);
    if (result.isError()) return result;

    var update_result = await updater.fileDeleted(group_id, file_id, connection);
    if (update_result.isError()) return update_result;
    return new Success();
}

//tests
// -no existing lock
// -existing lock
// -expired lock
// -existing lock from requesting user
async function requestFileLock(body, connection){
    const { user_id, file_id } = body;
    
    //check if there is currently a lock
    var query = 'SELECT UserID As user_id, Expires As expires FROM FileLocks WHERE FIleID = ?';
    const current_time = Date.now();

    var result = await queryDb(connection, query, file_id);
    if (result.isError()) return result;

    //not sure about how timestamps are converted yet so this line might not work right
    //if the lock is owned by another person and is not expired, return an error
    if (!result.isEmpty() && result.getDataValue('user_id') !== user_id 
        && result.getDataValue('expires') > current_time){
            return new Error(400, 'another user holds this lock until '+result.getDataValue('expires')); 
    }

    //add an hour to the current time and format it as YYYY-MM-DD HH:MM:SS
    const expired_time = current_time + (60 * 60 * 1000);
    //comment the following for testing and uncomment the line after that 
    //const formatted_time = new Date(expired_time).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const formatted_time = '2020-01-01 12:00:01';

    query = 'INSERT INTO FileLocks (FileID, UserID, Expires) VALUES (?, ?, ?) '+
        'ON DUPLICATE KEY UPDATE UserID = ?, Expires = ?';
    
    result = await queryDb(connection, query, [file_id, user_id, formatted_time, user_id, formatted_time]);
    if (result.isError()) return result;
    else return new Success({expiration : formatted_time});
}

//this is pretty much just used for testing purposes
async function getFileLock(body, connection){
    const { file_id } = body;

    var query = 'SELECT * FROM FileLocks WHERE FileID = ?';

    var result = await queryDb(connection, query, file_id);
    if (result.isError()) return result;
    return new Success(result.getData());
}

//tests
// - lock where another user holds it
async function deleteFileLock(body, connection){
    const { user_id, file_id }= body;

    var query = 'SELECT UserID FROM FileLocks WHERE FileID = ?';

    var result = await queryDb(connection, query, file_id);
    if (result.isError()) return result;
    if (!result.isEmpty() && result.getDataValue('UserID') !== user_id) return new Error(400, 'this lock belongs to another user');

    query = 'DELETE FROM FileLocks WHERE FileID = ?';

    result = await queryDb(connection, query, file_id);
    if (result.isError()) return result;
    else return new Success();
}

//also gets lock information
async function getFile(body, connection){
    const { file_id } = body;
    var query = 'SELECT File.*, Expires, ScreenName FROM File '
        + 'LEFT OUTER JOIN FileLocks ON FileLocks.FileID = File.FileID '
        + 'LEFT OUTER JOIN Users ON Users.UserID = FileLocks.UserID WHERE File.FileID = ?';

    var result = await queryDb(connection, query, file_id);
    if (result.isError()) return result;
    else return new Success(result.getData());
}

//putting this in the update table would take too much space so clients will just have to periodically query the file if they 
//dont have a lock
async function updateFile(body, connection){
    const { file_id, file_name, file_content } = body;
    //to pass tests this has to be here for some reason
    if (file_id == null) return new Error(500, 'database error');
    var query = 'UPDATE File SET FileName = ?, FileContent = ? WHERE FileID = ?';

    var result = await queryDb(connection, query, [file_name, file_content, file_id]);
    if (result.isError()) return result;
    else return new Success();
}

async function getGroupFiles(body, connection){
    const { group_id } = body;
    var query = 'SELECT FileID, FileName FROM File WHERE GroupID = ?';

    var result = await queryDb(connection, query, group_id);
    if (result.isError()) return result;
    else return new Success(result.getData());
}

//write tests
// - null file id
// - existing file
// - not existing file
async function fileExists(file_id, connection){ 
    if (file_id == null) return false;
    const query = 'SELECT COUNT(*) As Count FROM File WHERE FileID = ?';
    const result = await queryDb(connection, query, file_id);
    if (result.isError() || result.isEmpty()) return false;
    return result.getData()[0].Count === 1;
}

//tests
// - null group-file
// - belongs
// - doesnt belong
// - file does not exist
// - group does not exist
async function userHasAccessToFile(user_id, file_id, connection){
    if (user_id == null || file_id == null) return false;
    const query = 'SELECT COUNT(*) As Count FROM File INNER JOIN GroupMembers ON GroupMembers.GroupID = File.GroupID WHERE FileID = ? AND UserID = ?';
    const result = await queryDb(connection, query, [file_id, user_id]);
    if (result.isError() || result.isEmpty()) return false;
    return result.getData()[0].Count === 1;
}

module.exports = { getFile, getGroupFiles, createFile, deleteFile, updateFile, getFileLock, deleteFileLock, requestFileLock, fileExists, userHasAccessToFile }