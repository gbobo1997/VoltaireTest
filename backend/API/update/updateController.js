const { queryDb } = require('../db');
const { Success, Error } = require('../common');

//all the following will be pushed to the update table, which will later be attached to incoming queries
const update_type = {
    invited_to_group : 1,
    chat_created : 2,
    chat_deleted : 3,
    file_created : 4,
    file_deleted : 5
}

async function getUserUpdates(user_id, connection){
    //get all the updates
    var query = 'SELECT UpdateType, UpdateTime, UpdateContent \
        FROM UserUpdate WHERE UserId = ? ORDER BY UpdateTime DESC';
    const result = await queryDb(connection, query, user_id);
    if (result.isError()) return result;

    //delete the updates we just got
    query = 'DELETE FROM UserUpdate WHERE UserID = ?';
    const del_result = await queryDb(connection, query, user_id);
    if (del_result.isError()) return result;
    //convert string content to JSON
    for (var update of result.getData()){
        update.UpdateContent = JSON.parse(update.UpdateContent);
    }
    return new Success(result.getData());
}

async function insertGroupUpdate(group_id, type, content, connection){
    const user_result = await getUsersInGroup(group_id, connection);
    if (user_result.isError()) return user_result;
    //if the group has no users, exit
    if (user_result.getParams().length === 0) return new Success();

    const users = user_result.getParams();
    //for testing, commment the following line and uncomment the next
    //const time = Date.now();
    const time = 1;
    var values = [];
    for (var user of users){
        values = values.concat([user.UserID, type, content, time]);
    }
    const value_string = users.map(user => '(?,?,?,?)').join()

    var query = 'INSERT INTO UserUpdate (UserID, UpdateType, UpdateContent, UpdateTime) VALUES '+value_string;
    const result = await queryDb(connection, query, values);
    if (result.isError()) return result;
    return new Success();
}

//tests
// - valid parameters
// - user that does not exist
// - group that does not exist
// other validation should be covered at a higher level
async function invitedToGroup(group_id, user_id, inviting_user_name, connection){
    //get the name of the group for the invitation so that request does not have to be sent later
    var query = 'SELECT GroupName FROM ChatGroup WHERE GroupID = ?';
    const group_result = await queryDb(connection, query, group_id);
    if (group_result.isError()) return group_result;
    if (group_result.isEmpty()) return new Error(400, 'group does not exist');

    const group_name = group_result.getDataValue('GroupName');

    const type = update_type.invited_to_group;
    const content = JSON.stringify({group_id, group_name, inviting_user_name});

    //for testing, comment the following line and uncomment the one after
    //const time = Date.now();
    const time = 1;

    var query = 'INSERT INTO UserUpdate (UserID, UpdateType, UpdateContent, UpdateTime) VALUES (?, ?, ?, ?)';
    const result = await queryDb(connection, query, [user_id, type, content, time]);
    if (result.isError()) return result;
    return new Success();
}

async function chatCreated(group_id, chat_id, chat_name, connection){
    const type = update_type.chat_created;
    const content = JSON.stringify({chat_id, chat_name});
    return insertGroupUpdate(group_id, type, content, connection);
}

//does this need a chat name ?
async function chatDeleted(group_id, chat_id, connection){
    const type = update_type.chat_deleted;
    const content = JSON.stringify({chat_id});
    return insertGroupUpdate(group_id, type, content, connection);
}

//only need to tell the users of a new file, not its content?
async function fileCreated(group_id, file_id, file_name, connection){
    const type = update_type.file_created;
    const content = JSON.stringify({file_id, file_name});
    return insertGroupUpdate(group_id, type, content, connection);
}

async function fileDeleted(group_id, file_id, connection){
    const type = update_type.file_deleted;
    const content = JSON.stringify({file_id});
    return insertGroupUpdate(group_id, type, content, connection);
}


//this is a copy of the function in the group controller, it is put here to avoid a circular depedency
async function getUsersInGroup(group_id, connection){
    var query = 'SELECT GroupMembers.UserID, ScreenName FROM GroupMembers LEFT OUTER JOIN Users ON GroupMembers.UserID = Users.UserID WHERE GroupID = ?';

    var result = await queryDb(connection, query, group_id);
    if (result.isError()) return result;
    return new Success(result.getData());
}

module.exports = { insertGroupUpdate, getUserUpdates, invitedToGroup, chatCreated, chatDeleted, fileCreated, fileDeleted }