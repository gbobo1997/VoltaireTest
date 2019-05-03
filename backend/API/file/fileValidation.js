const controller = require('./fileController');
const group_controller = require('../group/groupController');
const { tokenValid } = require('../auth/authController');
const { Error, Success } = require('../common');

async function validateCreateFile(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.file_name == null || body.file_content == null || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {group_id : int, file_name : string, file_content : string, token : token}')
    }

    const {valid, user_id} = tokenValid(body.token);
    body.user_id = user_id;
    if (!valid) return new Error(401, 'token invalid');

    const group = await group_controller.groupExists(body.group_id, connection);
    if (!group) return new Error(400, 'group does not exist');

    const member = await group_controller.userIsAGroupMember(body.group_id, user_id, connection);
    if (!member) return new Error(400, 'user is not a member of the group');
    return new Success();
}

//a ton of these routes have the same validation, including
// - delete file
// - request file lock
// - delete file lock
async function validateFileIdTokenRoute(body, connection){
    if (body.file_id == null || !Number.isInteger(body.file_id) || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {file_id : int, token : token}');
    }

    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');
    body.user_id = user_id;

    const file = await controller.fileExists(body.file_id, connection);
    if (!file) return new Error(400, 'file does not exist');

    const access = await controller.userHasAccessToFile(user_id, body.file_id, connection);
    if (!access) return new Error(400, 'user cannot access this file');
    return new Success();
}

async function validateDeleteFile(body, connection){
    if (body.file_id == null || !Number.isInteger(body.file_id) || body.group_id == null || !Number.isInteger(body.group_id) || body.file_name == null || body.file_content == null || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {file_id : int, group_id : int, file_name : string, file_content : string, token : token}')
    }

    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');
    body.user_id = user_id;

    const file = await controller.fileExists(body.file_id, connection);
    if (!file) return new Error(400, 'file does not exist');

    const group = await group_controller.groupExists(body.group_id, connection);
    if (!group) return new Error(400, 'group does not exist');

    const access = await controller.userHasAccessToFile(user_id, body.file_id, connection);
    if (!access) return new Error(400, 'user cannot access this file');

    return new Success();
}

async function validateUpdateFile(body, connection){
    if (body.file_id == null || !Number.isInteger(body.file_id) || body.file_name == null || body.file_content == null || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {file_id : int, file_name : string, file_content : string, token : token}')
    }

    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');
    body.user_id = user_id;

    const file = await controller.fileExists(body.file_id, connection);
    if (!file) return new Error(400, 'file does not exist');

    const access = await controller.userHasAccessToFile(user_id, body.file_id, connection);
    if (!access) return new Error(400, 'user cannot access this file');

    //handles lock issues in the controller function
    return new Success();
}

async function validateGetGroupFiles(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {group_id : int, token : token}');
    }

    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');
    body.user_id = user_id;

    const group = await group_controller.groupExists(body.group_id, connection);
    if (!group) return new Error(400, 'group does not exist');

    const member = await group_controller.userIsAGroupMember(body.group_id, user_id, connection);
    if (!member) return new Error(400, 'user is not a member of the group');
    return new Success();
}

module.exports = { validateCreateFile, validateFileIdTokenRoute, validateUpdateFile, validateGetGroupFiles, validateDeleteFile }