const { Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, resetInsertIds } = require('../models');
const controller = require('../../API/group/groupController');
const validator = require('../../API/group/groupValidation');
const update_controller = require('../../API/update/updateController');
const { expect } = require('../test_suite');

function createGroupControllerSuite(){
    return new TestSuite('groupController.js', [
        createGroupTests(),
        deleteGroupTests(),
        updateGroupTests(),
        getUsersGroupsTests(),
        userIsAGroupMemberTests(),
        groupExistsTests(),
        userIsAGroupMemberTests(),
        inviteUserToGroupTests(),
        respondToInvitationTests(),
        userHasBeenInvitedToGroupTests()
    ]);
}

function createGroupValidationSuite(){
    return new TestSuite('groupValidation.js', [
        validateCreateGroupTests(),
        validateDeleteGroupTests(),
        validateUpdateGroupTests(),
        validateGetUserGroupsTests(),
        validateInviteUserToGroup(),
        validateRespondToinvitation()
    ]);
}

function createGroupTests(){
    const models = getDbModels();
    return new TestSuite('createGroup', [
        new Test('successfully creates a group when given correct parameters', models, async (connection) =>{
            const result = await controller.createGroup({user_id: 1, group_name: 'test'}, connection);
            assertSuccess(result, {group_id: 4});
            const group_result = await controller.getUsersGroups({user_id: 1}, connection);
            assertSuccess(group_result, [{group_id: 1, group_name: 'name'}, {group_id: 4, group_name: 'test'}]);
        }),
        new Test('returns a db error when given a null parameter in the first query', models, async (connection) =>{
            const result = await controller.createGroup({user_id: 1}, connection);
            assertError(result, 500, 'database error');
        }),
        new Test('returns a db error when given a null parameter in the second query', models, async (connection) =>{
            const result = await controller.createGroup({group_name: 'test'}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function deleteGroupTests(){
    const models = getDbModels();

    return new TestSuite('deleteGroup', [
        new Test('successfully deletes a group when given correct parameters', models, async (connection) =>{
            const result = await controller.deleteGroup({group_id : 1}, connection);
            assertSuccess(result);
            const group_result = await controller.getUsersGroups({user_id: 1}, connection);
            assertSuccess(group_result, []);
        }),
        new Test('returns a db error when given a null parameter', models, async (connection) =>{
            const result = await controller.deleteGroup({}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function updateGroupTests(){
    const models = getDbModels();

    return new TestSuite('updateGroup', [
        new Test('successfully updates a group when given correct parameters', models, async (connection) =>{
            const result = await controller.updateGroup({group_id: 1, group_name: 'test'}, connection);
            assertSuccess(result);
            const group_result = await controller.getUsersGroups({user_id: 1}, connection);
            assertSuccess(group_result, [{group_id: 1, group_name: 'test'}]);
        }),
        new Test('returns a db error when given a null parameter', models, async (connection) =>{
            const result = await controller.updateGroup({group_name: 'test'}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function getUsersGroupsTests(){
    const models = getDbModels();

    return new TestSuite('getUsersGroups', [
        new Test('successfully gets all the groups a user is a member of given correct parameters', models, async (connection) =>{
            const result = await controller.getUsersGroups({user_id: 2}, connection);
            assertSuccess(result, [{group_id: 1, group_name: 'name'}, {group_id: 2, group_name: 'name2'}]);
        }),
        new Test('returns a db error when given a null parameter', models, async (connection) =>{
            const result = await controller.getUsersGroups({}, connection);
            assertError(result, 500, 'database error');
        })
    ])
}

function inviteUserToGroupTests(){
    const models = getDbModels()

    return new TestSuite('inviteUserToGroup', [
        new Test('successfully invites a user to a group given correct parameters', models, async (connection) =>{
            const result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3});
            assertSuccess(result, null);

            const invite_result = await controller.getAllInvitations({user_id : 1}, connection);
            assertSuccess(invite_result, [{UserID: 1, GroupID: 3, SenderName: 'screen3'}]);

            const update_result = await update_controller.getUserUpdates(1, connection);
            assertSuccess(update_result, [{group_id : 3, group_name : 'name', inviting_user_name : 'screen3'}]);
        }),
        new Test('returns an error if the sending user does not exist', models, async (connection) =>{
            const result = await controller.inviteUserToGroup({user_id : 4, invitee_id : 1, group_id : 3}, connection);
            assertError(result, 400, 'user is not in the database');
        }),
        new Test('returns a database error given a null parameter', models, async (connection) =>{
            const result = await controller.inviteUserToGroup({user_id : 3, invitee_id : null, group_id : 3}, connection);
            assertError(result, 500, 'database error');
        }),
        new Test('returns a database error if the user has already been invited to the group', models, async (connection) =>{
            const result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3});
            assertSuccess(result, null);

            const second_result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3});
            assertError(second_result, 500, 'database error');
        })
    ])
}

function respondToInvitationTests(){
    const models = getDbModels();

    return new TestSuite('respondToInvitation', [
        new Test('adds a user to a group if the response is validly confirmed', models, async (connection) =>{
            const result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, connection);
            assertSuccess(result, null);

            const respond_result = await controller.respondToInvitation({user_id: 1, group_id: 3, confirmed: true}, connection);
            assertSuccess(respond_result, null);

            const invite_result = await controller.getAllInvitations({user_id : 1}, connection);
            assertSuccess(invite_result, []);

            const member_result = await controller.getUsersGroups({user_id : 1}, connection);
            assertSuccess(member_result, [{group_id: 1, group_name: 'name'}, {group_id: 3, group_name: 'name3'}]);
        }),
        new Test('does not add a user to a group if the response is validly denied', models, async (connection) =>{
            const result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, connection);
            assertSuccess(result, null);

            const respond_result = await controller.respondToInvitation({user_id: 1, group_id: 3, confirmed: false}, connection);
            assertSuccess(respond_result, null);

            const invite_result = await controller.getAllInvitations({user_id : 1}, connection);
            assertSuccess(invite_result, []);

            const member_result = await controller.getUsersGroups({user_id : 1}, connection);
            assertSuccess(member_result, [{group_id: 1, group_name: 'name'}]);
        }),
        new Test('returns an error given a null parameter', models, async (connection) =>{
            const result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, connection);
            assertSuccess(result, null);

            const respond_result = await controller.respondToInvitation({user_id: 1, group_id: null, confirmed: true}, connection);
            assertError(respond_result, 500, 'database error');

            const invite_result = await controller.getAllInvitations({user_id : 1}, connection);
            assertSuccess(invite_result, [{UserID: 1, GroupID: 3, SenderName: 'screen3'}]);
        }),
        new Test('does nothing given a null parameter and a denial', models, async (connection) =>{
            const result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, connection);
            assertSuccess(result, null);

            const respond_result = await controller.respondToInvitation({user_id: null, group_id: 3, confirmed: false}, connection);
            assertSuccess(respond_result, null);

            const invite_result = await controller.getAllInvitations({user_id : 1}, connection);
            assertSuccess(invite_result, [{UserID: 1, GroupID: 3, SenderName: 'screen3'}]);

            const member_result = await controller.getUsersGroups({user_id : 1}, connection);
            assertSuccess(member_result, [{group_id: 1, group_name: 'name'}]);
        })
    ])
}

function groupExistsTests(){
    const models = getDbModels();

    return new TestSuite('groupExists', [
        new Test('returns true given a valid group', models, async (connection) =>{
            const result = await controller.groupExists(1, connection);
            expect(result).to.be.true;
        }),
        new Test('returns false given a non-existant group', models, async (connection) =>{
            const result = await controller.groupExists(4, connection);
            expect(result).to.be.false;
        }),
        new Test('returns false given a null group_id', models, async (connection) =>{
            const result = await controller.groupExists(null, connection);
            expect(result).to.be.false;
        })
    ])
}

function userIsAGroupMemberTests(){
    const models = getDbModels();

    return new TestSuite('userIsAGroupMember', [
        new Test('returns true given a valid user and group that the user is a member of', models, async (connection) =>{
            const result = await controller.userIsAGroupMember(1, 1, connection);
            expect(result).to.be.true;
        }),
        new Test('returns false given a null parameter', models, async (connection) =>{
            const result = await controller.userIsAGroupMember(null, 1, connection);
            expect(result).to.be.false;
        }),
        new Test('return false given a valid user and group that the user is not a member of', models, async (connection) =>{
            const result = await controller.userIsAGroupMember(2, 1, connection);
            expect(result).to.be.false;
        }),
        new Test('return false given a nonexistant user', models, async (connection) =>{
            const result = await controller.userIsAGroupMember(4, 1, connection);
            expect(result).to.be.false;
        }),
        new Test('return false given a nonexistant group', models, async (connection) =>{
            const result = await controller.userIsAGroupMember(1, 4, connection);
            expect(result).to.be.false;
        })
    ]);
}

function userHasBeenInvitedToGroupTests(){
    const models = getDbModels();

    return new TestSuite('userHasBeenInvitedToGroup', [
        new Test('returns true given an existing invitation', models, async (connection) =>{
            const invite_result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, connection);
            assertSuccess(invite_result, null);

            const result = await controller.userHasBeenInvitedToGroup(3, 1, connection);
            expect(result).to.be.true;
        }),
        new Test('returns false if a user has not been invited to the group', models, async (connection) =>{
            const invite_result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, connection);
            assertSuccess(invite_result, null);

            const result = await controller.userHasBeenInvitedToGroup(2, 1, connection);
            expect(result).to.be.false;
        }),
        new Test('returns false given a null parameter', models, async (connection) =>{
            const result = await controller.userHasBeenInvitedToGroup(null, 1, connection);
            expect(result).to.be.false;
        })
    ])
}

function validateCreateGroupTests(){
    const models = getDbModels(1);

    return new TestSuite('validateCreateGroup', [
        new Test('successfully validates given the correct parameters', models, async (connection, token) =>{
            const result = await validator.validateCreateGroup({group_name : 'test', token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateCreateGroup({token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {group_name : string, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateCreateGroup({group_name: 'test', token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        })
    ]);
}

function validateDeleteGroupTests(){
    const models = getDbModels(1);

    return new TestSuite('validateDeleteGroup', [
        new Test('successfully validates given correct parameters', models, async (connection, token) =>{
            const result = await validator.validateDeleteGroup({group_id: 1, token: token}, connection);
            console.log(result);
            assertSuccess(result, null);
        }),
        new Test('fails validation given incomplete parameters', models, async (connection, token) =>{
            const result = await validator.validateDeleteGroup({group_id: 'NaN', token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {group_id : int, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateDeleteGroup({group_id: 1, token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation if the group does not exist', models, async (connection, token) =>{
            const result = await validator.validateDeleteGroup({group_id : 4, token : token}, connection);
            assertError(result, 400, 'group does not exist');
        }),
        new Test('fails validation if the user is not a member of the group', models, async (connection, token) =>{
            const result = await validator.validateDeleteGroup({group_id: 2, token: token}, connection);
            assertError(result, 400, 'user is not a member of the group');
        })
    ]);
}

function validateUpdateGroupTests(){
    const models = getDbModels(1);

    return new TestSuite('validateUpdateGroup', [
        new Test('successfully validates given correct parameters', models, async (connection, token) =>{
            const result = await validator.validateUpdateGroup({group_id: 1, group_name : 'test', token: token}, connection);
            console.log(result);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set',models, async (connection, token) =>{
            const result = await validator.validateUpdateGroup({group_id : null, group_name: 'test', token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {group_id : int, group_name : string, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateUpdateGroup({group_id : 1, group_name: 'test', token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation if the group does not exist', models, async (connection, token) =>{
            const result = await validator.validateUpdateGroup({group_id : 5, group_name: 'test', token: token}, connection);
            assertError(result, 400, 'group does not exist');
        }),
        new Test('fails validation if the user is not a member of the group', models, async (connection, token) =>{
            const result = await validator.validateUpdateGroup({group_id : 2, group_name:'test', token : token}, connection);
            assertError(result, 400, 'user is not a member of the group');
        })
    ]);
}

function validateGetUserGroupsTests(){
    const models = getDbModels(2);

    return new TestSuite('validateGetUserGroups', [
        new Test('successfully validates given a complete parameter set', models, async (connection, token) =>{
            const result = await validator.validateGetUserGroups({token : token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validator given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateGetUserGroups({token : null}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateGetUserGroups({user_id: 2, token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        })
    ]);
}

function validateInviteUserToGroup(){
    const models = getDbModels(3);

    return new TestSuite('validateInviteUserToGroup', [
        new Test('successfully validates given a complete parameter set', models, async (connection, token) =>{
            const result = await validator.validateInviteUserToGroup({token : token, group_id : 3, invitee_id : 1}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.valdiateInviteUserToGroup({token : token, group_id : '3', invitee_id : 1}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {token : token, confirmed : bool, group_id : int}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.valdiateInviteUserToGroup({token : token.split("").reverse().join(""), group_id : 3, invitee_id : 1}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a group that doesnt exist', models, async (connection, token) =>{
            const result = await validator.validateInviteUserToGroup({token : token, group_id : 4, invitee_id : 1}, connection);
            assertError(result, 400, 'group does not exist');
        }),
        new Test('validation fails if the invitee doesnt exist', models, async (connection, token) =>{
            const result = await validator.validateInviteUserToGroup({token : token, group_id : 3, invitee_id : 4}, connection);
            assertError(result, 400, 'invitee does not exist');
        }),
        new Test('validation fails if the invitee is already a member of the group', models, async (connection, token) =>{
            const result = await validator.validateInviteUserToGroup({token : token, group_id : 1, invitee_id : 1}, connection);
            assertError(result, 400, 'invitee is already a member of the group');
        }),
        new Test('validation fails if the inviting user is ot a member of the group', getDbModels(2), async (connection, token) =>{
            const result = await validator.validateInviteUserToGroup({token : token, group_id : 3, invitee_id : 1}, connection);
            assertError(result, 400, 'user is not a member of the group');
        }),
        new Test('validation fails if the invitee already has been invited to the group', models, async (connection, token) =>{
            const result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, connection);
            assertSuccess(result, null);
            
            const s_result = await validator.validateInviteUserToGroup({token : token, group_id : 3, invitee_id : 1}, connection);
            assertError(s_result, 400, 'invitee already has a invite to this group');
        })
    ])
}

function validateRespondToinvitation(){
    const models = getDbModels(1);

    return new TestSuite('validateRespondToInvitation', [
        new Test('successfully validates given a complete parameter set', models, async (connection, token) =>{
            const result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, connection);
            assertSuccess(result, null);

            const s_result = await validator.validateRespondToinvitation({group_id: 3, confirmed : true, token : token});
            assertSuccess(s_result);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, connection);
            assertSuccess(result, null);

            const s_result = await validator.validateRespondToinvitation({group_id: 3, confirmed : 1, token : token});
            assertError(s_result, 400, 'invalid parameters, send the following body: {token : token, confirmed : bool, group_id : int}')
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, connection);
            assertSuccess(result, null);

            const s_result = await validator.validateRespondToinvitation({group_id: 3, confirmed : true, token : token.split("").reverse().join("")});
            assertError(s_result, 401, 'token invalid')
        }),
        new Test('fails validation if the user has not been invited to the group', models, async (connection, token) =>{
            const s_result = await validator.validateRespondToinvitation({group_id: 3, confirmed : true, token : token, connection});
            assertError(s_result, 400, 'user has not been invited to the group')
        })
    ])
}

// group 1
// - user 1
// - user 2
// - user 3
// group 2
// - user 2
// - user 3
// group 3
// - user 3 
function getDbModels(token_id=null){
    resetInsertIds();

    const first_user = new UserModel('name', 'screen', 'test');
    const second_user = new UserModel('name2', 'screen2', 'test2');
    const third_user = new UserModel('name3', 'screen3', 'test3');

    const first_group = new GroupModel('name');
    const second_group = new GroupModel('name2');
    const third_group = new GroupModel('name3');

    first_group.addMember(first_user);
    first_group.addMember(second_user);
    first_group.addMember(third_user);
    second_group.addMember(second_user);
    second_group.addMember(third_user);
    third_group.addMember(third_user);

    const models = [first_user, second_user, third_user,
        first_group, second_group, third_group];

    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}

module.exports = { createGroupControllerSuite, createGroupValidationSuite };
