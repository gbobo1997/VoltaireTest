const { chai, expect, Test, TestSuite, assertRouteResult, assertRouteError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, ChatModel, resetInsertIds } = require('../models');
const {app} = require('../../API/index');

function createFileRouteSuite(){
    return new TestSuite('fileRoute.js', [
        getChatByIdTests(),
        createChatTests(),
        updateChatTests(),
        deleteChatTests(),
        getGroupFilesTests(),
        getFileLockTests(),
        deleteFileLockTests()
    ])
}

function getChatByIdTests(){

}

function createChatTests(){

}

function updateChatTests(){

}

function deleteChatTests(){

}

function getGroupFilesTests(){

}

function getFileLockTests(){

}

function deleteFileLockTests(){

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
