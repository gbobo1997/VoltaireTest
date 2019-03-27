const { Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, FileModel, resetInsertIds } = require('../models');
const controller = require('../../API/update/updateController');

function createUpdateControllerSuite(){
    return new TestSuite('updateController.js', [
        getUserUpdatesTests(),
        insertGroupUpdateTests(),
        //invitedToGroupTests(),
        //chatCreatedTests(),
        //chatDeletedTests(),
        //messageSentTests(),
        fileCreatedTests(),
        fileDeletedTests()
    ])
}

function getUserUpdatesTests(){
    const models = getDbModelsGroup();

    return new TestSuite('getUserUpdates', [
        new Test('successfully gets all updates for a user', models, async (connection) =>{
            var result = await controller.insertGroupUpdate(1, 1, JSON.stringify({test : 'value'}), connection);
            assertSuccess(result, null);
            result = await controller.insertGroupUpdate(1, 2, JSON.stringify({test : 'value2'}), connection);
            assertSuccess(result, null);

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, [{update_type : 1, update_time : '2019-04-21 14:32:00', update_content : '{test : \'value\'\}'},
                {update_type : 2, update_time : '2019-04-21 14:32:00', update_content : '{test : \'value2\'\}'}]);
        }),
        new Test('returns no updates if the user has no updates', models, async (connection) =>{
            var result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, []);
        }),
        new Test('returns no updates given an invalid user', models, async (connection) =>{
            var result = await controller.insertGroupUpdate(1, 1, JSON.stringify({test : 'value'}), connection);
            assertSuccess(result, null);
            result = await controller.getUserUdpates(2, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error given an invalid parameter', mdoels, async (connection) =>{
            var result = await controller.getUserUpdates(null, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function insertGroupUpdateTests(){
    const models = getDbModelsGroup();

    return new TestSuite('insertGroupUpdate', [
        new Test('successfully sends updates to all users in a group', models, async (connection) =>{
            var result = await controller.insertGroupUpdate(1, 1, JSON.stringify({test : 'value'}), connection);
            assertSuccess(result, null);

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, [{update_type : 1, update_time : '2019-04-21 14:32:00', update_content : '{test : \'value\'\}'}]);
            
            result = await controller.getUserUpdates(2, connection);
            assertSuccess(result, [{update_type : 1, update_time : '2019-04-21 14:32:00', update_content : '{test : \'value\'\}'}]);

            result = await controller.getUserUpdates(3, connection);
            assertSuccess(result, []);
        }),
        new Test('sends no updates if a group has no users', models, async (connection) =>{
            var result = await controller.insertGroupUpdate(2, 1, JSON.stringify({test : 'value'}), connection);
            assertSuccess(result, null);

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, []);
            
            result = await controller.getUserUpdates(2, connection);
            assertSuccess(result, []);

            result = await controller.getUserUpdates(3, connection);
            assertSuccess(result, []);
        }),
        new Test('sends no updates if a group does not exist', models, async (connection) =>{
            var result = await controller.insertGroupUpdate(5, 1, JSON.stringify({test : 'value'}), connection);
            assertSuccess(result, null);

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, []);
            
            result = await controller.getUserUpdates(2, connection);
            assertSuccess(result, []);

            result = await controller.getUserUpdates(3, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error given a null parameter', async (connection) =>{
            var result = await controller.insertGroupUpdate(1, null, JSON.stringify({test : 'value'}), connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function invitedToGroupTests(){

}

function chatCreatedTests(){

}

function chatDeletedTests(){

}

function messageSentTests(){

}

function fileCreatedTests(){
    const models = getDbModelsFile();

    return new TestSuite('fileCreated', [
        new Test('sends the update given correct parameters', models, async (connection) =>{
            var result = await controller.fileCreated(1, 3, 'new_file', connection);
            assertSuccess(result, null);
            var result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, {update_type: 5, update_time : '2019-04-21 14:32:00', 
                update_content : '{file_id : 3, file_name : \'new_file\'}'})
        })
    ])
}

function fileDeletedTests(){
    const models = getDbModelsFile();

    return new TestSuite('fileDeleted', [
        new Test('sends the update given correct parameters', models, async (connection) =>{
            var result = await controller.fileDeleted(1, 3, connection);
            assertSuccess(result, {update_type: 6, update_time : '2019-04-21 14:32:00', 
                update_content : '{file_id : 3}'})
        })
    ])
}

function getDbModelsGroup(token_id=null){
    resetInsertIds();

    const first_user = new UserModel('name', 'screen', 'test');
    const second_user = new UserModel('name2', 'screen2', 'test2');
    const third_user = new UserModel('name3', 'screen3', 'test3');

    const first_group = new GroupModel('name');
    const second_group = new GroupModel('name2');

    first_group.addMember(first_user);
    first_group.addMember(second_user);
    second_group.addMember(first_user);
    second_group.addMember(third_user);

    const models = [first_user, second_user, third_user,
        first_group, second_group];

    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}

function getDbModelsUpdate(token_id=null){
    resetInsertIds();

    const first_user = new UserModel('name', 'screen', 'test');
    const first_group = new GroupModel('name');

    first_group.addMember(first_user);

    const models = [first_user, second_user, first_group];

    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}

function getDbModelsFile(token_id=null){
    resetInsertIds();

    const first_user = new UserModel('name', 'screen', 'test');
    const first_group = new GroupModel('name');
    const first_file = new FileModel('name', 'content');
    const second_file = new FileModel('name2', 'content2');

    first_group.addMember(first_user);

    first_file.addToGroup(first_group);
    second_file.addToGroup(first_group);

    const models = [first_user, second_user, third_user,
        first_group, second_group, first_file, second_file];

    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}

module.exports = { createUpdateControllerSuite }