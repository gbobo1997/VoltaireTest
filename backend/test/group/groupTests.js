const { Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, resetInsertIds } = require('../models');
const controller = require('../../API/group/groupController');
const validator = require('../../API/group/groupValidation');

function createGroupControllerSuite(){
    return new TestSuite('groupController.js', [
        createGroupTests(),
        deleteGroupTests(),
        updateGroupTests(),
        getUsersGroupsTests()
    ]);
}

function createGroupValidationSuite(){
    return new TestSuite('groupValidation.js', [
        validateCreateGroupTests(),
        validateDeleteGroupTests(),
        validateUpdateGroupTests(),
        validateGetUserGroupsTests(),
        validateUserIsMemberOfGroupTests()
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

    return new TestSuite('getUsersModels', [
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

function validateCreateGroupTests(){
    const models = getDbModels(1);

    return new TestSuite('validateCreateGroup', [
        new Test('successfully validates given the correct parameters', models, async (connection, token) =>{
            const result = await validator.validateCreateGroup({user_id : 1, group_name : 'test', token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateCreateGroup({user_id: 1, token: token}, connection);
            assertError(result, 400, 'validation error');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateCreateGroup({user_id: 1, group_name: 'test', token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'auth error');
        }),
        new Test('fails validation given a miss-matched user id', models, async (connection, token)=>{
            const result = await validator.validateCreateGroup({user_id: 2, group_name: 'test', token: token}, connection);
            assertError(result, 400, 'tried to create a group for another user');
        })
    ]);
}

function validateDeleteGroupTests(){
    const models = getDbModels(1);

    return new TestSuite('validateDeleteGroup', [
        new Test('successfully validates given correct parameters', models, async (connection, token) =>{
            const result = await validator.validateDeleteGroup({group_id: 1, token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given incomplete parameters', models, async (connection, token) =>{
            const result = await validator.validateDeleteGroup({group_id: 'NaN', token: token}, connection);
            assertError(result, 400, 'validation error');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateDeleteGroup({group_id: 1, token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'auth error');
        }),
        new Test('fails validation if the user is not a member of the group', models, async (connection, token) =>{
            const result = await validator.validateDeleteGroup({group_id: 2, token: token}, connection);
            assertError(result, 400, 'the user is not a member of the group or group does not exist');
        })
    ]);
}

function validateUpdateGroupTests(){
    const models = getDbModels(1);

    return new TestSuite('validateUpdateGroup', [
        new Test('successfully validates given correct parameters', models, async (connection, token) =>{
            const result = await validator.validateUpdateGroup({group_id: 1, group_name : 'test', token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set',models, async (connection, token) =>{
            const result = await validator.validateUpdateGroup({group_name: 'test', token: token}, connection);
            assertError(result, 400, 'validation error');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateUpdateGroup({group_id : 1, group_name: 'test', token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'auth error');
        }),
        new Test('fails validation if the user is not a member of the group', models, async (connection, token) =>{
            const result = await validator.validateUpdateGroup({group_id : 2, group_name:'test', token : token}, connection);
            assertError(result, 400, 'the user is not a member of the group or group does not exist');
        })
    ]);
}

function validateGetUserGroupsTests(){
    const models = getDbModels(2);

    return new TestSuite('validateGetUserGroups', [
        new Test('successfully validates given a complete parameter set', models, async (connection, token) =>{
            const result = await validator.validateGetUserGroups({user_id : 2, token : token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validator given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateGetUserGroups({user_id : 'fail', token : token}, connection);
            assertError(result, 400, 'validation error');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateGetUserGroups({user_id: 2, token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'auth error');
        }),
        new Test('fails validation if the user_id does not match the token', models, async (connection, token) =>{
            const result = await validator.validateGetUserGroups({user_id : 1, token : token}, connection);
            assertError(result, 400, 'tried to get groups from another user');
        })
    ]);
}

function validateUserIsMemberOfGroupTests(){
    const models = getDbModels();

    return new TestSuite('validateUserIsMemberOfGroup', [
        new Test('successfully validates given correct parameters', models, async (connection) =>{
            const result = await validator.validateUserIsMemberOfGroup(1, 1, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation if given null parameters', models, async (connection) =>{
            const result = await validator.validateUserIsMemberOfGroup(null, 1, connection);
            assertError(result, 500, 'database error');
        }),
        new Test('fails validation if the user does not exist', models, async (connection) =>{
            const result = await validator.validateUserIsMemberOfGroup(5, 1, connection);
            assertError(result, 400, 'the user is not a member of the group or group does not exist');
        }),
        new Test('fails validation if the group does not exist', models, async (connection) =>{
            const result = await validator.validateUserIsMemberOfGroup(1, 5, connection);
            assertError(result, 400, 'the user is not a member of the group or group does not exist');
        }),
        new Test('fails validation if the user is not a member of the group', models, async (connection)=>{
            const result = await validator.validateUserIsMemberOfGroup(1, 2, connection);
            assertError(result, 400, 'the user is not a member of the group or group does not exist');
        })
    ]);
}

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
