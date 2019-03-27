const { queryDb } = require('../db');
const { Success, Error } = require('../common');

//need to write test
async function createChat(body, connection){
    const { user_id, group_id, chat_name } = body;
    var query = 'INSERT INTO Chat (chatName) VALUES (?)';

    var result = await queryDb(connection, query, group_name);
    if (result.isError()) return result;
    const chat_id = result.getAddedRowId();

    return new Success({chat_id : chat_id});
}

//need to write test
async function deleteChat(body, connection){
    const { chat_id, group_id } = body;
    var query = 'DELETE FROM Chat WHERE ChatID = ?';

    var result = await queryDb(connection, query, [ chat_id, group_id ]);
    if (result.isError()) return result;

    return new Success();
}

//need to write test
async function updateChat(body, connection){
    const { group_id, chat_id, chat_name } = body;
    var query = 'UPDATE Chat SET ChatName = ? WHERE ChatID = ?';
    if (group_id === undefined || chat_id === undefined || chat_name === undefined) return new Error(500, 'database error');

    var result = await queryDb(connection, query, [chat_name, chat_id, group_id]);
    if (result.isError()) return result;
    return new Success();
}

//need to write test
async function getChatsInGroup(group_id, connection){
    var query = 'SELECT ChatID FROM Chat WHERE GroupID = ?';

    var result = await queryDb(connection, query, group_id);
    if (result.isError()) return result;
    return new Success(result.getData());
}

module.exports = { createChat, deleteChat, updateChat, getChatsInGroup }