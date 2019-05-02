const controller = require('./groupController');
const user_controller = require('../auth/authController');
const { tokenValid } = require('../auth/authController');
const { Error, Success } = require('../common');

function validateCreateGroup(body){
    if (body.group_name == null || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {group_name : string, token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');

    body.user_id = user_id
    return new Success();
}

async function validateDeleteGroup(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {group_id : int, token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    body.user_id = user_id;
    if (!valid) return new Error(401, 'token invalid');

    const group = await controller.groupExists(body.group_id, connection);
    if (!group) return new Error(400, 'group does not exist');

    const member = await controller.userIsAGroupMember(body.group_id, user_id, connection);
    if (!member) return new Error(400, 'user is not a member of the group');
    return new Success();
}

async function validateUpdateGroup(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.group_name == null || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {group_id : int, group_name : string, token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    body.user_id = user_id;
    if (!valid) return new Error(401, 'token invalid');

    const group = await controller.groupExists(body.group_id, connection);
    if (!group) return new Error(400, 'group does not exist');

    const member = await controller.userIsAGroupMember(body.group_id, user_id, connection);
    if (!member) return new Error(400, 'user is not a member of the group');
    return new Success();
}

async function validateGetUserGroups(body){
    if (body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {token : token}');
    }
    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');

    body.user_id = user_id;
    return new Success();
}

async function validateInviteUserToGroup(body, connection){
    if (body.invitee_id == null || !Number.isInteger(body.invitee_id) || body.group_id == null || !Number.isInteger(body.group_id) || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {token : token, invitee_id : int, group_id : int}');
    }

    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');
    body.user_id = user_id;

    const group = await controller.groupExists(body.group_id, connection);
    if (!group) return new Error(400, 'group does not exist');

    const member = await controller.userIsAGroupMember(body.group_id, user_id, connection);
    if (!member) return new Error(400, 'user is not a member of the group');

    const invitee = await user_controller.userExists(body.invitee_id, connection);
    if (!invitee) return new Error(400, 'invitee does not exist');

    const i_member = await controller.userIsAGroupMember(body.group_id, body.invitee_id, connection);
    if (i_member) return new Error(400, 'invitee is already a member of the group');

    const prior_invitation = await controller.userHasBeenInvitedToGroup(body.group_id, body.invitee_id, connection);
    if (prior_invitation) return new Error(400, 'invitee already has a invite to this group');

    return new Success()
}

async function validateRespondToinvitation(body, connection){
    if (body.group_id == null || !Number.isInteger(body.group_id) || body.confirmed == null || typeof body.confirmed !== 'boolean' || body.token == null){
        return new Error(400, 'invalid parameters, send the following body: {token : token, confirmed : bool, group_id : int}')
    }

    const {valid, user_id} = tokenValid(body.token);
    if (!valid) return new Error(401, 'token invalid');
    body.user_id = user_id;

    const prior_invitation = await controller.userHasBeenInvitedToGroup(body.group_id, user_id, connection);
    if (!prior_invitation) return new Error(400, 'user has not been invited to the group');

    return new Success()
}

module.exports = { validateCreateGroup, validateDeleteGroup, validateUpdateGroup, validateGetUserGroups, validateInviteUserToGroup, validateRespondToinvitation }