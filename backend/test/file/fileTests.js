const { expect, Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
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
        getGroupFilesTests(),
        fileExistsTests(),
        userHasAccesToFileTests()
    ]);
}

function createFileValidationSuite(){
    return new TestSuite('fileValidation.js', [
        validateCreateFileTests(),
        valdiateFileIdTokenRouteTests(),
        validateUpdateFileTests(),
        validateGetGroupFilesTests()
    ]);
}

function createFileTests(){
    const models = getDbModels();

    return new TestSuite('createFile', [
        new Test('creates a file given correct parameters', models, async (connection) =>{
            var result = await controller.createFile({group_id : 2, file_name : 'new_file', file_content: 'new_content'}, connection);
            assertSuccess(result, {file_id : 4});

            result = await controller.getFile({file_id : 4}, connection);
            assertSuccess(result, [{FileID : 4, GroupID : 2, FileName: 'new_file', FileContent: 'new_content', ScreenName: null, Expires: null}]);

            result = await update_controller.getUserUpdates(2, connection);
            assertSuccess(result, [{UpdateType : 4, UpdateTime : 1, UpdateContent : {file_id: 4,file_name: "new_file"}}]);
        }),
        new Test('returns an error given a null parameter', models, async (connection) =>{
            result = await controller.createFile({group_id : 2, file_name : null, file_content: 'new_content'}, connection);
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
            assertSuccess(result, [{UpdateType : 5, UpdateTime : 1, UpdateContent : {file_id: 1}}]);
        }),
        new Test('does nothing with a non-existent file (but does send an update - will be fixed in validation)', models, async (connection) =>{
            var result = await controller.deleteFile({file_id : 4, group_id : 1}, connection);
            assertSuccess(result, null);

            result = await controller.getGroupFiles({group_id : 1}, connection);
            assertSuccess(result, [{FileID: 1, FileName: 'name'}, {FileID: 2, FileName: 'name2'}]);
        
            result = await update_controller.getUserUpdates(1, connection);
            assertSuccess(result, [{UpdateType : 5, UpdateTime : 1, UpdateContent : {file_id:4}}]);
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
        new Test('gets the lock on a file given correct input', models, async (connection) =>{
            var result = await controller.getFileLock({file_id : 1}, connection);
            assertSuccess(result, [{FileID : 1, UserID : 1, Expires: 1546369200000}]);
        }),
        new Test('returns nothing given a file that has no lock', models, async (connection) =>{
            var result = await controller.getFileLock({file_id : 3}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns nothing given a file that does not exist', models, async (connection) =>{
            var result = await controller.getFileLock({file_id : 4}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error given a null parameter', models, async (connection) =>{
            var result = await controller.getFileLock({file_id : null}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function requestFileLockTests(){
    const models = getDbModels();

    return new TestSuite('requestFileLock', [
        new Test('grants the lock on an unlocked file', models, async (connection) =>{
            var result = await controller.requestFileLock({user_id : 1, file_id : 3}, connection);
            assertSuccess(result, {expiration: 1546369200001});
        }),
        new Test('grants the lock on a file with an expired lock', models, async (connection) =>{
            var result = await controller.requestFileLock({user_id : 2, file_id : 1}, connection);
            assertSuccess(result, {expiration: 1546369200001});
        }),
        new Test('grants the lock when the same user currently has the lock', models, async (connection) =>{
            var result = await controller.requestFileLock({user_id : 1, file_id : 2}, connection);
            assertSuccess(result, {expiration: 1546369200001});
        }),
        new Test('grants the lock when the same user has the lock and it is expired', models, async (connection) =>{
            var result = await controller.requestFileLock({user_id : 1, file_id : 1}, connection);
            assertSuccess(result, {expiration: 1546369200001});
        }),
        new Test('does not grant the lock on a file that currently has a lock from another user', models, async (connection) =>{
            var result = await controller.requestFileLock({user_id : 2, file_id : 2}, connection);
            assertError(result, 400, 'another user holds this lock until 1577905200000');
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
            var result = await controller.deleteFileLock({user_id : 1, file_id : 1}, connection);
            assertSuccess(result, null);

            result = await controller.getFileLock({file_id: 1}, connection);
            assertSuccess(result, []);
        }),
        new Test('does nothing if another user holds the lock', models, async (connection) =>{
            var result = await controller.deleteFileLock({user_id : 2, file_id : 1}, connection);
            assertError(result, 400, 'this lock belongs to another user');

            result = await controller.getFileLock({file_id : 1}, connection);
            assertSuccess(result, [{FileID : 1, UserID : 1, Expires : 1546369200000}]);
        }),
        new Test('does nothing to a file that has no lock', models, async (connection) =>{
            var result = await controller.deleteFileLock({user_id : 1, file_id : 3}, connection);
            assertSuccess(result, null);

            result = await controller.getFileLock({file_id: 3}, connection);
            assertSuccess(result, []);
        }),
        new Test('does nothing given an invalid file', models, async (connection) =>{
            var result = await controller.deleteFileLock({user_id : 1, file_id : 4}, connection);
            assertSuccess(result, null);

            result = await controller.getFileLock({file_id: 4}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error given a null parameter', models, async (connection) =>{
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
            assertSuccess(result, [{FileID : 1, GroupID : 1, FileName: 'name', FileContent: 'content', 
                ScreenName: 'screen', Expires: 1546369200000}]);
        }),
        new Test('returns nothing given a file that doesnt exist', models, async (connection) =>{
            const result = await controller.getFile({file_id : 4}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a database error given a null parameter', models, async (connection) =>{
            const result = await controller.getFile({}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function updateFileTests(){
    const models = getDbModels();

    return new TestSuite('updateFile', [
        new Test('updates the file given correct parameters (also the user has a lock on the file)', models, async (connection) =>{
            var result = await controller.updateFile({user_id: 1, file_id : 2, file_name: 'new_name', file_content: 'new_content'}, connection);
            assertSuccess(result, {expiration: 1546369200001});

            result = await controller.getFile({file_id: 2}, connection);
            assertSuccess(result, [{FileID : 2, GroupID : 1, FileName: 'new_name', FileContent: 'new_content', 
                ScreenName: 'screen', Expires: 1546369200001}])
        }),
        new Test('updates the file if the updating user has an expired lock on the file', models, async (connection) =>{
            var result = await controller.updateFile({user_id: 1, file_id : 1, file_name: 'new_name', file_content: 'new_content'}, connection);
            assertSuccess(result, {expiration: 1546369200001});

            result = await controller.getFile({file_id: 1}, connection);
            assertSuccess(result, [{FileID : 1, GroupID : 1, FileName: 'new_name', FileContent: 'new_content', 
                ScreenName: 'screen', Expires: 1546369200001}])
        }),
        new Test('updates the file if another user has an expired lock on the file', models, async (connection) =>{
            var result = await controller.updateFile({user_id: 2, file_id : 1, file_name: 'new_name', file_content: 'new_content'}, connection);
            assertSuccess(result, {expiration: 1546369200001});

            result = await controller.getFile({file_id: 1}, connection);
            assertSuccess(result, [{FileID : 1, GroupID : 1, FileName: 'new_name', FileContent: 'new_content', 
                ScreenName: 'screen2', Expires: 1546369200001}])
        }),
        new Test('returns an error if another user has a lock on the file', models, async (connection) =>{
            var result = await controller.updateFile({user_id: 2, file_id : 2, file_name: 'new_name', file_content: 'new_content'}, connection);
            assertError(result, 400, 'another user holds this lock until 1577905200000');
        }),
        new Test('returns a db error given a non-existent file', models, async (connection) =>{
            var result = await controller.updateFile({user_id : 2, file_id : 4, file_name: 'new_name', file_content: 'new_content'}, connection);
            assertError(result, 500, 'database error');
        }),
        new Test('returns an error when given a null parameter', models, async (connection) =>{
            var result = await controller.updateFile({file_id : null, file_name: 'new_name', file_content: 'new_content'}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function getGroupFilesTests(){
    const models = getDbModels();

    return new TestSuite('getGroupFiles', [
        new Test('returns all a groups files given correct parameters', models, async (connection) =>{
            const result = await controller.getGroupFiles({group_id : 1}, connection);
            assertSuccess(result, [{FileID: 1, FileName: 'name'}, {FileID: 2, FileName: 'name2'}]);
        }),
        new Test('returns no file given a group with no files', models, async (connection) =>{
            const result = await controller.getGroupFiles({group_id : 2}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns no files given a non-existent group', models, async (connection) =>{
            const result = await controller.getGroupFiles({group_id : 4}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error given a null parameter', models, async (connection) =>{
            const result = await controller.getGroupFiles({group_id : null}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function fileExistsTests(){
    const models = getDbModels();

    return new TestSuite('fileExists', [
        new Test('returns true given a file that exists', models, async (connection) =>{
            const result = await controller.fileExists(1, connection);
            expect(result).to.be.true;
        }),
        new Test('returns false given a nonexistent file', models, async (connection) =>{
            const result = await controller.fileExists(4, connection);
            expect(result).to.be.false;
        }),
        new Test('returns false given a null file id', models, async (connection) =>{
            const result = await controller.fileExists(null, connection);
            expect(result).to.be.false;
        })
    ])
}

function userHasAccesToFileTests(){
    const models = getDbModels();

    return new TestSuite('userHasAccessToFile', [
        new Test('returns true given a file that belongs to a group the user is a part of', models, async (connection) =>{
            const result = await controller.userHasAccessToFile(1, 1, connection);
            expect(result).to.be.true;
        }),
        new Test('returns false given a file that does not belong to a group the user is a part of', models, async (connection) =>{
            const result = await controller.userHasAccessToFile(1, 3, connection);
            expect(result).to.be.false;
        }),
        new Test('returns false given a user that doesnt exist', models, async (connection) =>{
            const result = await controller.userHasAccessToFile(5, 1, connection);
            expect(result).to.be.false;
        }),
        new Test('returns false given a file that doesnt exist', models, async (connection) =>{
            const result = await controller.userHasAccessToFile(1, 5, connection);
            expect(result).to.be.false;
        }),
        new Test('return false given a null parameters', models, async (connection) =>{
            const result = await controller.userHasAccessToFile(null, 1, connection);
            expect(result).to.be.false;
        })
    ])
}

function validateCreateFileTests(){
    const models = getDbModels(1);

    return new TestSuite('validateCreateFile', [
        new Test('succeeds validation given correct input', models, async (connection, token) =>{
            const result = await validator.validateCreateFile({group_id: 1, file_name: 'new_name', file_content: 'content', token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an undefined parameter', models, async (connection, token) =>{
            const result = await validator.validateCreateFile({group_id : 1, file_name: 'new_name', file_content: 'content'}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {group_id : int, file_name : string, file_content : string, token : token}');
        }),
        new Test('fails validation given a group that does not exist', models, async (connection, token) =>{
            const result = await validator.validateCreateFile({group_id : 4, file_name: 'new_name', file_content: 'content', token : token}, connection);
            assertError(result, 400, 'group does not exist');
        }),
        new Test('fails validation given a group the user is not a member of', models, async (connection, token) =>{
            const result = await validator.validateCreateFile({group_id : 2, file_name: 'new_name', file_content: 'content', token : token}, connection);
            assertError(result, 400, 'user is not a member of the group');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateCreateFile({group_id: 1, file_name: 'new_name', file_content: 'content', token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        })
    ]);
}

function valdiateFileIdTokenRouteTests(){
    const models = getDbModels(1);

    return new TestSuite('validateFileIdTokenRoute', [
        new Test('succeeds validation given correct input', models, async (connection, token) =>{
            const result = await validator.validateFileIdTokenRoute({file_id : 1, token : token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateFileIdTokenRoute({file_id : 'one', token : token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {file_id : int, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateFileIdTokenRoute({file_id:1 , token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a file that doesnt exist', models, async (connection, token) =>{
            const result = await validator.validateFileIdTokenRoute({file_id : 5, token : token}, connection);
            assertError(result, 400, 'file does not exist');
        }),
        new Test('fails validation given a file that the user doesnt have access to', models, async (connection, token) =>{
            const result = await validator.validateFileIdTokenRoute({file_id : 3, token : token}, connection);
            assertError(result, 400, 'user cannot access this file');
        })
    ]);
}

function validateUpdateFileTests(){
    const models = getDbModels(1);

    return new TestSuite('validateUpdateFile', [
        new Test('succeeds validation given correct input', models, async (connection, token) =>{
            const result = await validator.validateUpdateFile({file_id: 1, file_name: 'new_name', file_content: 'new_content', token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given a null parameter', models, async (connection, token) =>{
            const result = await validator.validateUpdateFile({file_id: null, file_name: 'new_name', file_content: 'new_content', token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {file_id : int, file_name : string, file_content : string, token : token}');
        }),
        new Test('fails validation given a invalid token', models, async (connection, token) =>{
            const result = await validator.validateUpdateFile({file_id: 1, file_name: 'new_name', file_content: 'new_content', token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a file that does not exist', models, async (connection, token) =>{
            const result = await validator.validateUpdateFile({file_id: 5, file_name: 'new_name', file_content: 'new_content', token : token}, connection);
            assertError(result, 400, 'file does not exist');
        }),
        new Test('fails validation given a file the user does not have access to', models, async (connection, token) =>{
            const result = await validator.validateUpdateFile({file_id : 3, file_name: 'new_name', file_content: 'new_content', token : token}, connection);
            assertError(result, 400, 'user cannot access this file');
        })
    ]);
}

function validateGetGroupFilesTests(){
    const models = getDbModels(1);

    return new TestSuite('validateGetGroupFiles', [
        new Test('succeeds validation given valid parameters', models, async (connection, token) =>{
            const result = await validator.validateGetGroupFiles({group_id : 1, token : token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given a non-int group_id', models, async (connection, token) =>{
            const result = await validator.validateGetGroupFiles({group_id : 'one', token : token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {group_id : int, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateGetGroupFiles({group_id : 1, token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a non-existent group', models, async (connection, token) =>{
            const result = await validator.validateGetGroupFiles({group_id: 4, token : token}, connection);
            assertError(result, 400, 'group does not exist');
        }),
        new Test('fails validation given a group the user is not a member of', models, async (connection, token) =>{
            const result = await validator.validateGetGroupFiles({group_id : 2, token : token}, connection);
            assertError(result, 400, 'user is not a member of the group');
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

module.exports = { createFileControllerSuite, createFileValidationSuite }