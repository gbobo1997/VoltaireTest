const { queryDb } = require('../db');
const { Success} = require('../common');

async function sendMessage(body, connection){
    const { user_id, content, chat_id } = body;

    //comment the top line for prod, the bottom for testing
    const time = 1;
    //const time = Date.now()

    var query = 'INSERT INTO Message (UserID, MessageContent, TimeSent, ChatID) VALUES (?, ?, ?, ?)';

    var result = await queryDb(connection, query, [user_id, content, time, chat_id]);
    if (result.isError()) return result;
    const message_id = result.getAddedRowId();

    return new Success({message_id : message_id});
}

async function getMessageInChat(body, connection){
    const{ chat_id } = body;
    var query = 'SELECT Message.*, ScreenName FROM Message '
    + 'LEFT OUTER JOIN Users ON Users.UserID = Message.UserID WHERE Message.ChatID = ? '
    + 'ORDER BY TimeSent DESC LIMIT 50';

    var result = await queryDb(connection, query, chat_id)
    if (result.isError()) return result;
    return new Success({messages: result.getData()});
}

async function getRecentMessages(body, connection){
    const { chat_id, message_id } = body;
    var query = 'SELECT Message.*, ScreenName FROM Message '
    +'LEFT OUTER JOIN Users ON Users.UserID = Message.UserID WHERE Message.TimeSent > ( '
    +'SELECT TimeSent FROM Message WHERE MessageID = ?) AND Message.ChatID = ? ORDER BY TimeSent DESC LIMIT 50'

    var result = await queryDb(connection, query, [message_id, chat_id]);
    if (result.isError()) return result;
    return new Success({messages: result.getData()});
}

async function messageExists(message_id, connection){
    if (message_id == null) return false;

    var query = 'SELECT Count(*) AS Count FROM Message WHERE MessageID = ?';
    var result = await queryDb(connection, query, message_id);
    if (result.isError() || result.getDataValue('Count') === 0) return false;
    return true;
}

async function messageIsInChat(message_id, chat_id, connection){
    if (message_id == null || chat_id == null) return false;

    var query = 'SELECT Count(*) AS Count FROM Message WHERE MessageID = ? AND ChatID = ?';
    var result = await queryDb(connection, query, [message_id, chat_id]);
    if (result.isError() || result.getDataValue('Count') === 0) return false;
    return true;
}

module.exports = { sendMessage, getMessageInChat, getRecentMessages, messageExists, messageIsInChat }