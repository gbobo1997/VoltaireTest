const { queryDb } = require('../db');
const { Success, Error } = require('../common');
const { getUsersInGroup } = require('../group/groupController');

//all the following will be pushed to the update table, which will later be attached to incoming queries
const update_type = {
    invited_to_group : 1,
    chat_created : 2,
    chat_deleted : 3,
    message_sent : 4,
    file_created : 5,
    file_deleted : 6
}

async function getUserUpdates(){

}

//tests
// -group that doesnt exist
// -group with no users
// -invalid input parameters
async function insertGroupUpdate(group_id, type, content, connection){
    const user_result = getUsersInGroup(group_id, connection);
    if (user_result.isError()) return user_result;
    if (user_result.isEmpty()) return new Error(400, 'there are no users in desired group');

    const users = user_result.getParams();
    const time = Date.now().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const values = users.map(user => [user.UserID, type, content, time]).flat();
    const value_string = users.map(user => '(?,?,?)').join

    var query = 'INSERT INTO UserUpdates (UserID, UpdateType, UpdateContent, UpdateTime) VALUES '+value_string;
    const result = await queryDb(connection, query, values);
    if (result.isError()) return result;
    return new Success();
}

async function invitedToGroup(){

}

async function chatCreated(){

}

async function chatDeleted(){

}

async function messageSent(){

}

//only need to tell the users of a new file, not its content?
async function fileCreated(group_id, file_id, file_name, connection){
    const type = update_type.file_created;
    const content = {file_id, file_name};
    return insertGroupUpdate(group_id, type, content, connection);
}

async function fileDeleted(group_id, file_id, connection){
    const type = update_type.file_deleted;
    const content = {file_id};
    return insertGroupUpdate(group_id, type, content, connection);
}

module.exports = { getUserUpdates, invitedToGroup, chatCreated, chatDeleted, messageSent,fileCreated, fileDeleted, fileLockChanged, fileUpdated }