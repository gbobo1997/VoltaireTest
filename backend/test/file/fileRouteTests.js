const { chai, expect, Test, TestSuite, assertRouteResult, assertRouteError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, FileModel, resetInsertIds } = require('../models');
const {app} = require('../../API/index');

function createFileRouteSuite(){
    return new TestSuite('fileRoute.js', [
        getChatByIdTests(),
        createChatTests(),
        updateChatTests(),
        deleteChatTests(),
        getGroupFilesTests(),
        requestFileLockTests(),
        deleteFileLockTests()
    ])
}

function getChatByIdTests(){
    const models = getDbModels(1);

    return new TestSuite('POST /get_by_id', [
        new Test('it should get a file when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/get_by_id')
                .send({token: token, file_id: 1});
            
            assertRouteResult(result, 200, [{FileID : 1, GroupID : 1, FileName: 'name', FileContent: 'content', 
                ScreenName: 'screen', Expires: 1546369200000}]);
        }),
        new Test('it should send a validation error given an invalid parameter set (string instead of int)', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/get_by_id')
                .send({token : token, file_id: '1'});

            assertRouteError(result, 400, 'invalid parameters, send the following body: {file_id : int, token : token}');
        }),
        new Test('it should send a validation error given other validation error (non-existant file)', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/get_by_id')
                .send({token : token, file_id: 4});
            
            assertRouteError(result, 400, 'file does not exist');
        }),
        new Test('it should send an auth error given an invalid token', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/get_by_id')
                .send({token : token.split("").reverse().join(""), file_id: 1});
        
            assertRouteError(result, 401, 'token invalid');
        }) 
    ])
}

function createChatTests(){
    const models = getDbModels(1);

    return new TestSuite('POST /create', [
        new Test('it should create a file when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/create')
                .send({token: token, group_id: 1, file_name: 'name', file_content: 'content'});
            assertRouteResult(result, 200, {file_id : 4});
        }),
        new Test('it should send a validation error given an invalid parameter set (missing parameter)', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/create')
                .send({token : token, group_id: 1, file_content: 'content'});

            assertRouteError(result, 400, 'invalid parameters, send the following body: {group_id : int, file_name : string, file_content : string, token : token}');
        }),
        new Test('it should send a validation error given other validation error (group user does not have access to)', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/create')
                .send({token : token, group_id: 2, file_name: 'name', file_content: 'content'});
            
                assertRouteError(result, 400, 'user is not a member of the group');
        }),
        new Test('it should send an auth error given an invalid token', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/create')
                .send({token : token.split("").reverse().join(""), group_id: 1, file_name: 'name', file_content: 'content'});
        
            assertRouteError(result, 401, 'token invalid');
        }) 
    ])
}

function updateChatTests(){
    const models = getDbModels(2);

    return new TestSuite('PATCH /update', [
        new Test('it should update a file name when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .patch('/file/update')
                .send({token: token, file_id: 1, file_name: 'new_name', file_content: 'content'});
            assertRouteResult(result, 200, {expiration: 1546369200001});
        }),
        new Test('it should send a validation error given an invalid parameter set (string instead of int)', models, async (c, token) =>{
            const result = await chai.request(app)
                .patch('/file/update')
                .send({token : token, file_id: 'one', file_name: 'new_name', file_content: 'content'});

            assertRouteError(result, 400, 'invalid parameters, send the following body: {file_id : int, file_name : string, file_content : string, token : token}');
        }),
        new Test('it should send a validation error given other validation error (another user holds lock on file)', models, async (c, token) =>{
            const result = await chai.request(app)
                .patch('/file/update')
                .send({token : token, file_id: 2, file_name: 'new_name', file_content: 'content'});
            
                assertRouteError(result, 400, 'another user holds this lock until 1577905200000');
        }),
        new Test('it should send an auth error given an invalid token', models, async (c, token) =>{
            const result = await chai.request(app)
                .patch('/file/update')
                .send({token : token.split("").reverse().join(""), file_id: 1, file_name: 'new_name', file_content: 'content'});
        
            assertRouteError(result, 401, 'token invalid');
        }) 
    ])
}

function deleteChatTests(){
    const models = getDbModels(1);

    return new TestSuite('DELETE /delete', [
        new Test('it should delete a file when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/file/delete')
                .send({token: token, file_id: 1, group_id : 1});
            assertRouteResult(result, 200);
        }),
        new Test('it should send a validation error given an invalid parameter set (issing parameter)', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/file/delete')
                .send({token : token});

            assertRouteError(result, 400, 'invalid parameters, send the following body: {file_id : int, token : token}');
        }),
        new Test('it should send a validation error given other validation error (user doesnt have access to file)', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/file/delete')
                .send({token : token, file_id: 3, group_id : 1});
            
            assertRouteError(result, 400, 'user cannot access this file');
        }),
        new Test('it should send an auth error given an invalid token', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/file/delete')
                .send({token : token.split("").reverse().join(""), file_id: 1, group_id : 1});
        
            assertRouteError(result, 401, 'token invalid');
        }) 
    ])
}

function getGroupFilesTests(){
    const models = getDbModels(1);

    return new TestSuite('POST /group_files', [
        new Test('it should get all group files when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/group_files')
                .send({token: token, group_id: 1});
            
            assertRouteResult(result, 200, [{FileID: 1, FileName: 'name'}, {FileID: 2, FileName: 'name2'}]);
        }),
        new Test('it should send a validation error given an invalid parameter set (string instead of int)', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/group_files')
                .send({token : token, group_id: 'nope'});

            assertRouteError(result, 400, 'invalid parameters, send the following body: {group_id : int, token : token}');
        }),
        new Test('it should send a validation error given other validation error (group does not exist)', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/group_files')
                .send({token : token, group_id : 4});
            
            assertRouteError(result, 400, 'group does not exist');
        }),
        new Test('it should send an auth error given an invalid token', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/group_files')
                .send({token : token.split("").reverse().join(""), group_id: 1});
            assertRouteError(result, 401, 'token invalid');
        }) 
    ])
}

function requestFileLockTests(){
    const models = getDbModels(2);

    return new TestSuite('POST /lock', [
        new Test('it should get a valid lock when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/lock')
                .send({token: token, file_id: 1});
            
            assertRouteResult(result, 200, {expiration: 1546369200001});
        }),
        new Test('it should send a validation error given an invalid parameter set (missing parameter)', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/lock')
                .send({token : token});

            assertRouteError(result, 400, 'invalid parameters, send the following body: {file_id : int, token : token}');
        }),
        new Test('it should send a validation error given other validation error (another user holds the lock)', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/lock')
                .send({token : token, file_id : 2});
            
            assertRouteError(result, 400, 'another user holds this lock until 1577905200000');
        }),
        new Test('it should send an auth error given an invalid token', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/file/lock')
                .send({token : token.split("").reverse().join(""), file_id: 1});
        
            assertRouteError(result, 401, 'token invalid');
        }) 
    ])
}

function deleteFileLockTests(){
    const models = getDbModels(1);

    return new TestSuite('DELETE /delete_lock', [
        new Test('it should delete a lock when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/file/delete_lock')
                .send({token: token, file_id: 2});
            
            assertRouteResult(result, 200);
        }),
        new Test('it should send a validation error given an invalid parameter set (missing parameter)', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/file/delete_lock')
                .send({file_id : 1});

            assertRouteError(result, 400, 'invalid parameters, send the following body: {file_id : int, token : token}');
        }),
        new Test('it should send a validation error given other validation error (file does not exist)', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/file/delete_lock')
                .send({token : token, file_id : 4});
            
            assertRouteError(result, 400, 'file does not exist');
        }),
        new Test('it should send an auth error given an invalid token', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/file/delete_lock')
                .send({token : token.split("").reverse().join(""), file_id: 1});
        
            assertRouteError(result, 401, 'token invalid');
        }) 
    ])
}

/*
Group 1:
    - User 1
    - User 2
    - User 3
    - File 1 (expired lock by User 1)
    - File 2 (lock by User 1)
Group 2:
    - User 2
    - User 3
Group 3:
    - User 3 
    - File 3
*/
function getDbModels(token_id=null){
    resetInsertIds();

    const first_user = new UserModel('name', 'screen', 'name');
    const second_user = new UserModel('name2', 'screen2', 'name2');
    const third_user = new UserModel('name3', 'screen3', 'test3');

    const first_group = new GroupModel('name');
    const second_group = new GroupModel('name2');
    const third_group = new GroupModel('name3');

    const first_file = new FileModel('name', 'content');
    const second_file = new FileModel('name2', 'content2');
    const third_file = new FileModel('name3', 'content3');

    first_group.addMember(first_user);
    first_group.addMember(second_user);
    first_group.addMember(third_user);
    second_group.addMember(second_user);
    second_group.addMember(third_user);
    third_group.addMember(third_user);

    first_file.addToGroup(first_group);
    second_file.addToGroup(first_group);
    third_file.addToGroup(third_group);
    // 1546369200000
    first_file.addLock(first_user, 1546369200000);
    // 1577905200000
    second_file.addLock(first_user, 1577905200000);

    const models = [first_user, second_user, third_user,
        first_group, second_group, third_group, first_file, 
        second_file, third_file];

    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}

module.exports = { createFileRouteSuite }