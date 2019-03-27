const { Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, FileModel, resetInsertIds } = require('../models');
const controller = require('../../API/file/fileController');
const update_controller = require('../../API/update/updateController');
const validator = require('../../API/file/fileValidation');

function createFileControllerSuite(){
    return new TestSuite('fileController.js', [
        createFileTests(),
        deleteFileTests(),
        getFileLockTests(),
        requestFileLockTests(),
        deleteFileLockTests(),
        getFileTests(),
        updateFileTests(),
        getGroupFilesTests()
    ]);
}

function createFileValidationSuite(){
    return new TestSuite('fileValidation.js', [

    ]);
}

function createFileTests(){
    const models = getDbModels();

    return new TestSuite('createFile', [
        new Test('creates a file given correct parameters', models, async (connection) =>{
            var result = await controller.createFile({group_id : 2, file_name : 'new_file', file_content: 'new_content'}, connection);
            assertSuccess(result, {file_id : 4});

            result = await controller.getFile({file_id : 4}, connection);
            assertSuccess(result, {FileId : 4, FileName: 'new_name', FileContent: 'new_content'});

            result = await update_controller.getUserUpdates(2, connection);
            assertSuccess(result, {update_type : 5, update_time : '2019-04-21 14:32:00', update_content : '{file_id : 4, file_name : \'new_file\'}'});
        }),
        new Test('returns an error given a null parameter', models, async (connection) =>{
            result = await controller.createFile({group_id : 2, file_name : null, file_content: 'new_content'});
            assertError(result, 500, 'database error');
        })
    ]);
}

function deleteFileTests(){
    const models = getDbModels();

    return new TestSuite('deleteFile', [
        new Test('deletes a file given correct parameters', models, async (connection) =>{
            var result = await controller.deleteFile({file_id : 1, group_id : 1}, connection);
            assertSuccess(result, null);

            result = await controller.getFile({file_id : 1}, connection);
            assertSuccess(result, []);

            result = await update_controller.getUserUpdates(1, connection);
            assertSuccess(result, {update_type : 6, update_time : '2019-04-21 14:32:00', update_content : '{file_id : 1}'});
        }),
        new Test('does nothing with a non-existent file (but does send an update - will be fixed in validation)', models, async (connection) =>{
            var result = await controller.deleteFile({file_id : 4, group_id : 1}, connection);
            assertSuccess(result, null);

            result = await controller.getGroupFiles({group_id : 1}, connection);
            assertSuccess(result, [{FileId: 1, FileName: 'test'}, {FileId: 2, FileName: 'test2'}]);
        
            result = await update_controller.getUserUpdates(1, connection);
            assertSuccess(result, {update_type : 6, update_time : '2019-04-21 14:32:00', update_content : '{file_id : 4}'});
        }),
        new Test('returns a db error given an undefined parameter', models, async (connection) =>{
            var result = await controller.getGroupFiles({file_id : 1}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function getFileLockTests(){
    const models = getDbModels();

    return new TestSuite('getFileLock', [
        new Test('gets the lock on a file given correct parameters', models, async (connection) =>{
            const result = await controller.getFileLock({file_id : 1}, connection);
            assertSuccess(result, {FileId : 1, UserId : 1, ScreenName: 'user', Expires: '2019-01-01 12:00:00'});
        }),
        new Test('gets no lock when a file does not have one', models, async (connection) =>{
            const result = await controller.getFileLock({file_id : 3}, connection);
            assertSuccess(result, []);
        }),
        new Test('gets no lock when the file does not exist', models, async (connection) =>{
            const result = await controller.getFileLock({file_id : 4}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error given an udefined parameter', models, async (connection) =>{
            const result = await controller.getFileLock({}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function requestFileLockTests(){
    const models = getDbModels();

    return new TestSuite('requestFileLock', [
        new Test('grants the lock on an unlocked file', models, async (connection) =>{
            var result = await controller.requestFileLock({user_id : 1, file_id : 3}, connection);
            assertSuccess(result, {expiration: '2020-01-01 12:00:01'});
        }),
        new Test('grants the lock on a file with an expired lock', models, async (connection) =>{
            var result = await controller.requestFileLock({user_id : 2, file_id : 1}, connection);
            assertSuccess(result, {expiration: '2020-01-01 12:00:01'});
        }),
        new Test('grants the lock when the same user currently has the lock', models, async (connection) =>{
            var result = await controller.requestFileLock({user_id : 1, file_id : 2}, connection);
            assertSuccess(result, {expiration: '2020-01-01 12:00:01'});
        }),
        new Test('does not grant the lock on a file that currently has a lock from another user', models, async (connection) =>{
            var result = await controller.requestFileLock({user_id : 2, file_id : 2}, connection);
            assertError(result, 400, 'another user holds this lock until 2020-01-01 12:00:00');
        }),
        new Test('returns a db error when trying to lock a file that doesnt exist', models, async (connection) =>{
            var result = await controller.requestFileLock({user_id : 1, file_id : 4}, connection);
            assertError(result, 500, 'database error');
        }),
        new Test('returns a db error when trying to lock a file with a user that doesnt exist', models, async(connection) =>{
            var result = await controller.requestFileLock({user_id : 4, file_id : 3}, connection);
            assertError(result, 500, 'database error');
        }),
        new Test('returns a db error given a null parameter', models, async (connection) =>{
            var result = await controller.requestFileLock({user_id : null, file_id : null}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function deleteFileLockTests(){
    const models = getDbModels();

    return new TestSuite('deleteFileLock', [
        new Test('deletes the lock given correct parameters', models, async (connection) =>{
            var result = await controller.deleteFileLock({file_id : 1}, connection);
            assertSuccess(result, null);

            result = await controller.getFileLock({file_id: 1}, connection);
            assertSuccess(result, []);
        }),
        new Test('does nothing to a file that has no lock', models, async (connection) =>{
            var result = await controller.deleteFileLock({file_id : 3}, connection);
            assertSuccess(result, null);

            result = await controller.getFileLock({file_id: 3}, connection);
            assertSuccess(result, []);
        }),
        new Test('does nothing given an invalid file', model, async (connecton) =>{
            var result = await controller.deleteFileLock({file_id : 4}, connection);
            assertSuccess(result, null);

            result = await controller.getFileLock({file_id: 4}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error given a null parameter', model, async (connection) =>{
            var result = await controller.deleteFileLock({file_id : null}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function getFileTests(){
    const models = getDbModels();

    return new TestSuite('getFile', [
        new Test('gets the file given correct parameters', models, async (connection) =>{
            const result = await controller.getFile({file_id: 1}, connection);
            assertSuccess(result, {FileId : 1, FileName: 'name', FileContent: 'content', 
                ScreenName: 'name', Expires: '2019-01-01 12:00:00'});
        }),
        new Test('returns nothing given a file that doesnt exist', models, async (connection) =>{
            const result = await controller.getFile({file_id : 4}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a database error given a null parameter', mdoels, async (connection) =>{
            const result = await controller.getFile({}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function updateFileTests(){
    const models = getDbModels();

    return new TestSuite('udpateFile', [
        new Test('updates the file given correct parameters', models, async (connection) =>{
            var result = await controller.updateFile({file_id : 1, file_name: 'new_name', file_content: 'new_content'}, connection);
            assertSuccess(result, null);

            result = await controller.getFile({file_id: 1}, connection);
            assertSuccess(result, {FileId : 1, FileName: 'new_name', FileContent: 'new_content', 
                ScreenName: 'name', Expires: '2019-01-01 12:00:00'})
        }),
        new Test('does nothing given a non-existent file', models, async (connection) =>{
            var result = await controller.updateFile({file_id : 4, file_name: 'new_name', file_content: 'new_content'}, connection);
            assertSuccess(result, null);

            result = await controller.getGroupFiles({group_id : 1}, connection);
            assertSuccess(result, [{FileId: 1, FileName: 'test'}, {FileId: 2, FileName: 'test2'}]);
        }),
        new Test('returns an error when given an undefined parameter', models, async (connection) =>{
            var result = await controller.updateFile({file_id: 1, file_name: 'new_name'}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function getGroupFilesTests(){
    const models = getDbModels();

    return new TestSuite('getGroupFiles', [
        new Test('returns all a groups files given correct parameters', models, async (connection) =>{
            const result = await controller.getGroupFiles({group_id : 1}, connection);
            assertSuccess(result, [{FileId: 1, FileName: 'test'}, {FileId: 2, FileName: 'test2'}]);
        }),
        new Test('returns no file given a group with no files', models, async (connection) =>{
            const result = await controller.getGroupFiles({group_id : 2}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns no files given a non-existent group', models, async (connection) =>{
            const result = await controller.getGroupFiles({group_id : 3}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error given a null parameter', models, async (connection) =>{
            const result = await controller.getGroupFiles({group_id : null}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
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

    const first_user = new UserModel('name', 'screen', 'test');
    const second_user = new UserModel('name2', 'screen2', 'test2');
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
    first_file.addLock(first_user, '2019-01-01 12:00:00');
    second_file.addLock(first_user, '2020-01-01 12:00:00');

    const models = [first_user, second_user, third_user,
        first_group, second_group, third_group, first_file, 
        second_file, third_file];

    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}

module.exports = { createFileControllerSuite, createFileValidationSuite }