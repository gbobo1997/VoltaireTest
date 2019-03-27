const controller = require('./chatController');
const { authToken } = require('../auth/authController');
const { Error, Success } = require('../common');

function validateCreateChat(body){
    if (body.user_id == null || !Number.isInteger(body.user_id) || body.group_id == null || !Number.isInteger(body.group_id) || body.chat_name == null || body.token == null){
        return new Error(400, 'validation error');
    }
    const token_result = authToken(body.token);
    if (token_result.isError()) return token_result;

    const token_id = token_result.getParam('id');
    if (token_id !== body.user_id ) return new Error(400, 'tried to create a chat for a group');
    return new Success();
}

async function validateDeleteChat(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.chat_id == null || !Number.isInteger(body.chat_id) || body.token == null){
        return new Error(400, 'validation error');
    }
    const token_result = authToken(body.token);
    if (token_result.isError()) return token_result;

    const token_id = token_result.getParam('id');
    const member_result = await validateUserIsMemberOfGroup(token_id, body.group_id, connection);
    if (member_result.isError()) return member_result;
    return new Success();
}

async function validateUpdateChat(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.chat_id == null || !Number.isInteger(body.chat_id) || body.chat_name == null || body.token == null){
        return new Error(400, 'validation error');
    }
    const token_result = authToken(body.token);
    if (token_result.isError()) return token_result;

    const token_id = token_result.getParam('id');
    const member_result = await validateUserIsMemberOfGroup(token_id, body.group_id, connection);
    if (member_result.isError()) return member_result;
    return new Success();
}

async function validateGetChatInGroup(body){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.chat_id == null || !Number.isInteger(body.chat_id) || body.token == null){
        return new Error(400, 'validation error');
    }
    const token_result = authToken(body.token);
    if (token_result.isError()) return token_result;

    const token_id = token_result.getParam('id');
    if (token_id !== body.group_id) return new Error(400, 'tried to get chats from a group');
    return new Success();
}

module.exports = { validateCreateChat, validateDeleteChat, validateUpdateChat, validateGetChatInGroup }