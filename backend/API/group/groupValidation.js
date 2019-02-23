const controller = require('./groupController');
const { authToken } = require('../auth/authController');
const { Error, Success } = require('../common');

function validateCreateGroup(body){
    if (body.user_id == null || !Number.isInteger(body.user_id) || body.group_name == null || body.token == null){
        return new Error(400, 'validation error');
    }
    const token_result = authToken(body.token);
    if (token_result.isError()) return token_result;

    const token_id = token_result.getParam('id');
    if (token_id !== body.user_id ) return new Error(400, 'tried to create a group for another user');
    return new Success();
}

async function validateDeleteGroup(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.token == null){
        return new Error(400, 'validation error');
    }
    const token_result = authToken(body.token);
    if (token_result.isError()) return token_result;

    const token_id = token_result.getParam('id');
    const member_result = await validateUserIsMemberOfGroup(token_id, group_id, connection);
    if (member_result.isError()) return member_result;
    return new Success();
}

async function validateUpdateGroup(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.group_name == null || body.token == null){
        return new Error(400, 'validation error');
    }
    const token_result = authToken(body.token);
    if (token_result.isError()) return token_result;

    const token_id = token_result.getParam('id');
    const member_result = await validateUserIsMemberOfGroup(token_id, body.group_id, connection);
    if (member_result.isError()) return member_result;
    return new Success();
}

async function validateDeleteGroup(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.token == null){
        return new Error(400, 'validation error');
    }
    const token_result = authToken(body.token);
    if (token_result.isError()) return token_result;

    const token_id = token_result.getParam('id');
    const member_result = await validateUserIsMemberOfGroup(token_id, body.group_id, connection);
    if (member_result.isError()) return member_result;
    return new Success();
}

async function validateGetUserGroups(body){
    if (body.user_id == null || !Number.isInteger(body.user_id) || body.token == null){
        return new Error(400, 'validation error');
    }
    const token_result = authToken(body.token);
    if (token_result.isError()) return token_result;

    const token_id = token_result.getParam('id');
    if (token_id !== body.user_id) return new Error(400, 'tried to get groups from another user');
    return new Success();
}

async function validateUserIsMemberOfGroup(user_id, group_id, connection){
    const user_group_result = await controller.getUsersGroups({user_id}, connection);
    if (user_group_result.isError()) return user_group_result;

    const groups = user_group_result.getParams().map(result => result.GroupID);
    if (groups.length === 0 || !groups.includes(group_id)) return new Error(400, 'the user is not a member of the group or group does not exist');
    return new Success();
}

module.exports = { validateCreateGroup, validateDeleteGroup, validateUpdateGroup, validateGetUserGroups }