const { queryDb } = require('../db');
const { Success, Error } = require('../common');
const updater = require('../update/updateController');

//update tests to reflect the fact that the updater has been added
async function createChat(body, connection){
    const { group_id, chat_name } = body;
    var query = 'INSERT INTO Chat (ChatName, GroupID) VALUES (?, ?)';

    var result = await queryDb(connection, query, [chat_name, group_id]);
    if (result.isError()) return result;
    const chat_id = result.getAddedRowId();

    var update_result = await updater.chatCreated(group_id, chat_id, chat_name, connection);
    if (update_result.isError()) return update_result;

    return new Success({chat_id : chat_id});
}

//update tests due to the addition of the updater
async function deleteChat(body, connection){
    const { chat_id } = body;
    var query = 'DELETE FROM Chat WHERE ChatID = ?';

    var result = await queryDb(connection, query, chat_id);
    if (result.isError()) return result;

    var update_result = await updater.chatDeleted(group_id, chat_id, connection);
    if (update_result.isError()) return update_result;
    return new Success();
}

async function updateChat(body, connection){
    const { chat_id, chat_name } = body;
    var query = 'UPDATE Chat SET ChatName = ? WHERE ChatID = ?';
    
    var result = await queryDb(connection, query, [chat_name, chat_id]);
    if (result.isError()) return result;
    return new Success();
}

async function getChatsInGroup(body, connection){
    const { group_id } = body;
    var query = 'SELECT * FROM Chat WHERE GroupID = ?';

    var result = await queryDb(connection, query, group_id);
    if (result.isError()) return result;
    return new Success(result.getData());
}

async function chatExists(chat_id, connection){
    if (chat_id == null) return false;
    const query = 'SELECT COUNT(*) As Count FROM Chat WHERE ChatID = ?';
    const result = await queryDb(connection, query, chat_id);
    if (result.isError()) return false;
    return (result.getData()[0].Count === 1);
}

async function userHasAccessToChat(user_id, chat_id, connection){
    if (user_id == null || chat_id == null) return false;
    const query = `SELECT COUNT(*) AS Count FROM Chat INNER JOIN GroupMembers ON Chat.GroupID = GroupMembers.GroupID 
        WHERE ChatID = ? AND UserID = ?`;
    const result = await queryDb(connection, query, [chat_id, user_id]);
    if (result.isError()) return false;
    return (result.getData()[0].Count === 1);
}

module.exports = { createChat, deleteChat, updateChat, getChatsInGroup, chatExists, userHasAccessToChat }