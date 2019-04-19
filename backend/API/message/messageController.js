const { queryDb } = require('../db');
const { Success} = require('../common');

async function sendMessage(body, connection){
    const { user_id, content, chat_id } = body;

    var query = 'INSERT INTO Message (UserID, MessageContent, TimeSent, ChatID) VALUES (?, ?, ?, ?)';

    var result = await queryDb(connection, query, [user_id, content, time, chat_id]);
    if (result.isError()) return result;
    const message_id = result.getAddedRowId();

    return new Success({message_id : message_id});
}

async function getMessageInChat(body, connection){
    const{ chat_id } = body;
    var query = 'SELECT Messages.*, ScreenName FROM Messages '
    + 'LEFT OUTER JOIN Users ON Users.UserID = Message.UserID WHERE Message.ChatID = ? '
    + 'ORDER BY TimeSent DESC LIMIT 50';

    var result = await queryDb(connection, query, chat_id)
    if (result.isError()) return result;
    return new Success(result.getData());
}

async function getRecentMessages(body, connection){
    const { chat_id, message_id } = body;
    var query = 'SELECT Messages.*, ScreenName FROM Messages '
    +'LEFT OUTER JOIN Users ON Users.UserID = Message.UserID WHERE Message.TimeSent > ( '
    +'SELECT TimeSent FROM Messages WHERE MessageID = ?) AND Message.ChatID = ? ORDER BY TimeSent DESC LIMIT 50'

    var result = await queryDb(connection, query, [message_id, chat_id]);
    if (result.isError()) return result;
    return new Success(result.getData());
}

module.exports = { sendMessage, getMessageInChat, getRecentMessages }