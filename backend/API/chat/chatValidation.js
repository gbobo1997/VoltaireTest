const { tokenValid } = require('../auth/authController');
const { Error, Success } = require('../common');
const group = require('../group/groupController');
const controller = require('../chat/chatController');

async function validateCreateChat(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.chat_name == null || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {group_id : int, chat_name : string, token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    body.user_id = user_id;
    if (!valid) return new Error(401, 'token invalid');

    const group_res = await group.groupExists(body.group_id, connection);
    if (!group_res) return new Error(400, 'group does not exist');

    const member = await group.userIsAGroupMember(body.group_id, user_id, connection);
    if (!member) return new Error(400, 'user is not a member of group');
    return new Success();
}

async function validateDeleteChat(body, connection){
    if (body.chat_id == null || !Number.isInteger(body.chat_id) || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {chat_id : int, token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    body.user_id = user_id;
    if (!valid) return new Error(401, 'token invalid');

    const chat = await controller.chatExists(body.chat_id, connection);
    if (!chat) return new Error(400, 'chat does not exist');

    const access = await controller.userHasAccessToChat(user_id, body.chat_id, connection);
    if (!access) return new Error(400, 'user does not have access to this chat');
    return new Success();
}

async function validateUpdateChat(body, connection){
    if (body.chat_id == null || !Number.isInteger(body.chat_id) || body.chat_name == null || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {chat_id : int, chat_name : string, token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    body.user_id = user_id;
    if (!valid) return new Error(401, 'token invalid');

    const chat = await controller.chatExists(body.chat_id, connection);
    if (!chat) return new Error(400, 'chat does not exist');

    const access = await controller.userHasAccessToChat(user_id, body.chat_id, connection)
    if (!access) return new Error(400, 'user does not have access to this chat');
    return new Success();
}

async function validateGetChatsFromGroup(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {group_id : int, token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    body.user_id = user_id;
    if (!valid) return new Error(401, 'token invalid');

    const group_res = await group.groupExists(body.group_id, connection);
    if (!group_res) return new Error(400, 'group does not exist');

    const member = await group.userIsAGroupMember(body.group_id, user_id, connection)
    if (!member) return new Error('user is not a member of this group');
    return new Success();
}

module.exports = { validateCreateChat, validateDeleteChat, validateUpdateChat, validateGetChatsFromGroup }