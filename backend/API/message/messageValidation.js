const chat_controller = require('../chat/chatController');
const { tokenValid } = require('../auth/authController');
const { Error, Success } = require('../common');

async function validateSendMessage(body, connection){
    if (body.user_id == null || !Number.isInteger(body.user_id) || body.content == null || body.time_sent == null || !Number.isInteger(body.chat_id) || body.chat_id == null || !Number.isInteger(body.chat_id) || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {user_id : int, content : string, time_sent : int, chat_id: int , token : token}')
    }

    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');
    return new Success();
}

async function validateGetMessageInChat(body, connection){
    if ( body.chat_id == null || !Number.isInteger(body.chat_id) || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {chat_id: int , token : token}');
    }

    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401,'token invalid');
    body.user_id = user_id;

    const chat = await chat_controller.chatExists(body.chat_id, connection);
    if (!chat) return new Error(400, 'chat does not exist');

    const member = await chat_controller.userHasAccessToChat(body.user_id, body.chat_id, conection);
    if (!member) return new Error(400, 'user does not have access to chat');
    return new Success();
}

module.exports = { validateSendMessage, validateGetMessageInChat, validateGetMessageInChat }