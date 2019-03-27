const controller = require('./groupController');
const { tokenValid } = require('../auth/authController');
const { Error, Success } = require('../common');

//rewrite tests (user_id removed)
// - invalid parameters
// - invalid token
function validateCreateGroup(body){
    if (body.group_name == null || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {group_name : string, token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');

    body.user_id = user_id
    return new Success();
}

//rewrite tests
// - invalid parameters
// - invalid token
// - nonexistent group
// - group the user is not a member of
async function validateDeleteGroup(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {group_id : int, token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');

    if (!controller.groupExists(body.group_id, connection)) return new Error(400, 'group does not exist');
    if (!controller.userIsAGroupMember(body.group_id, user_id, connection)) return new Error(400, 'user is not a member of the group');
    return new Success();
}

//rewrite tests
// - invalid parameters
// - invalid token
// - nonexistent group
// - group the user is not a member of
async function validateUpdateGroup(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.group_name == null || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {group_id : int, group_name : string, token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');

    if (!controller.groupExists(body.group_id, connection)) return new Error(400, 'group does not exist');
    if (!controller.userIsAGroupMember(body.group_id, user_id, connection)) return new Error(400, 'user is not a member of the group');
    return new Success();
}

//rewrite tests (user_id removed)
// - invalid token
// - invalid parameters
async function validateGetUserGroups(body){
    if (body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');

    body.user_id = user_id;
    return new Success();
}

module.exports = { validateCreateGroup, validateDeleteGroup, validateUpdateGroup, validateGetUserGroups }