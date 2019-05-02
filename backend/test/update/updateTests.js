const { Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, FileModel, ChatModel, resetInsertIds } = require('../models');
const controller = require('../../API/update/updateController');

function createUpdateControllerSuite(){
    return new TestSuite('updateController.js', [
        getUserUpdatesTests(),
        insertGroupUpdateTests(),
        invitedToGroupTests(),
        chatCreatedTests(),
        chatDeletedTests(),
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
            assertSuccess(result, {});
            result = await controller.insertGroupUpdate(1, 2, JSON.stringify({test : 'value2'}), connection);
            assertSuccess(result, {});

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, [{UpdateType : 1, UpdateTime : 1, UpdateContent : {test:"value"}},
                {UpdateType : 2, UpdateTime : 1, UpdateContent : {test:"value2"}}]);
        }),
        new Test('returns no updates if the user has no updates', models, async (connection) =>{
            var result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, []);
        }),
        new Test('returns no updates given an invalid user', models, async (connection) =>{
            var result = await controller.insertGroupUpdate(1, 1, JSON.stringify({test : 'value'}), connection);
            assertSuccess(result, {});
            result = await controller.getUserUpdates(5, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error given an invalid parameter', models, async (connection) =>{
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
            assertSuccess(result, {});

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, [{UpdateType : 1, UpdateTime : 1, UpdateContent : {test:"value"}}]);
            
            result = await controller.getUserUpdates(2, connection);
            assertSuccess(result, [{UpdateType : 1, UpdateTime : 1, UpdateContent : {test:"value"}}]);

            result = await controller.getUserUpdates(3, connection);
            assertSuccess(result, []);
        }),
        new Test('sends no updates if a group does not exist', models, async (connection) =>{
            var result = await controller.insertGroupUpdate(5, 1, JSON.stringify({test : 'value'}), connection);
            assertSuccess(result, {});

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, []);
            
            result = await controller.getUserUpdates(2, connection);
            assertSuccess(result, []);

            result = await controller.getUserUpdates(3, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error given a null parameter', models, async (connection) =>{
            var result = await controller.insertGroupUpdate(null, 1, JSON.stringify({test : 'value'}), connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function invitedToGroupTests(){
    const models = getDbModelsGroup();

    return new TestSuite('invitedToGroup', [
        new Test('successfully inserts updates given correct parameters', models, async (connection) =>{
            var result = await controller.invitedToGroup(1, 3, 'screen', connection);
            assertSuccess(result, {});

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, []);

            result = await controller.getUserUpdates(3, connection);
            assertSuccess(result, [{UpdateType : 1, UpdateTime : 1, UpdateContent : {group_id : 1, group_name : 'name', inviting_user_name : 'screen'}}]);
        }),
        new Test('should not send an update if the group does not exist', models, async (connection) =>{
            var result = await controller.invitedToGroup(4, 3, 'screen', connection);
            assertError(result, 400, 'group does not exist');

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, []);

            result = await controller.getUserUpdates(3, connection);
            assertSuccess(result, []);
        }),
        new Test('should not send an update if the invitee does not exist', models, async (connection) =>{
            var result = await controller.invitedToGroup(1, 4, 'screen', connection);
            assertError(result, 500, 'database error');

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, []);

            result = await controller.getUserUpdates(3, connection);
            assertSuccess(result, []);
        })
    ])
}

function chatCreatedTests(){
    const models = getDbModelsChat();

    return new TestSuite('chatCreated', [
        new Test('successfully sends updates given correct input', models, async (connection) =>{
            var result = await controller.chatCreated(1, 3, 'new_chat', connection);
            assertSuccess(result, {});

            var result = await controller.chatCreated(2, 4, 'other_new_chat', connection);
            assertSuccess(result, {});

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, [{UpdateType : 2, UpdateTime : 1, UpdateContent : {chat_id : 3, chat_name : 'new_chat'}}, {UpdateType : 2, UpdateTime : 1, UpdateContent : {chat_id : 4, chat_name : 'other_new_chat'}}]);
            
            result = await controller.getUserUpdates(2, connection);
            assertSuccess(result, [{UpdateType : 2, UpdateTime : 1, UpdateContent : {chat_id : 3, chat_name : 'new_chat'}}]);

            result = await controller.getUserUpdates(3, connection);
            assertSuccess(result, [{UpdateType : 2, UpdateTime : 1, UpdateContent : {chat_id : 4, chat_name : 'other_new_chat'}}]);
        })
    ])
}

function chatDeletedTests(){
    const models = getDbModelsChat();

    return new TestSuite('chatDeleted', [
        new Test('successfully sends updates given correct input', models, async (connection) =>{
            var result = await controller.chatDeleted(1, 3, connection);
            assertSuccess(result, {});

            var result = await controller.chatDeleted(2, 4, connection);
            assertSuccess(result, {});

            result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, [{UpdateType : 3, UpdateTime : 1, UpdateContent : {chat_id : 3}}, {UpdateType : 3, UpdateTime : 1, UpdateContent : {chat_id : 4}}]);
            
            result = await controller.getUserUpdates(2, connection);
            assertSuccess(result, [{UpdateType : 3, UpdateTime : 1, UpdateContent : {chat_id : 3}}]);

            result = await controller.getUserUpdates(3, connection);
            assertSuccess(result, [{UpdateType : 3, UpdateTime : 1, UpdateContent : {chat_id : 4}}]);
        })
    ])
}

function messageSentTests(){

}

function fileCreatedTests(){
    const models = getDbModelsFile();

    return new TestSuite('fileCreated', [
        new Test('sends the update given correct parameters', models, async (connection) =>{
            var result = await controller.fileCreated(1, 3, 'new_file', connection);
            assertSuccess(result, {});
            var result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, [{UpdateType: 4, UpdateTime : 1, 
                UpdateContent : {file_id: 3, file_name: "new_file"}}])
        })
    ])
}

function fileDeletedTests(){
    const models = getDbModelsFile();

    return new TestSuite('fileDeleted', [
        new Test('sends the update given correct parameters', models, async (connection) =>{
            var result = await controller.fileDeleted(1, 3, connection);
            assertSuccess(result, {});
            var result = await controller.getUserUpdates(1, connection);
            assertSuccess(result, [{UpdateType: 5, UpdateTime : 1, 
                UpdateContent : {file_id: 3}}])
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

function getDbModelsChat(token_id=null){
    resetInsertIds();

    const first_user = new UserModel('name', 'screen', 'test');
    const second_user = new UserModel('name2', 'screen2', 'test2');
    const third_user = new UserModel('name3', 'screen3', 'test3');

    const first_group = new GroupModel('name');
    const second_group = new GroupModel('name2');

    const first_chat = new ChatModel('chat');
    const second_chat = new ChatModel('chat2');

    first_group.addMember(first_user);
    first_group.addMember(second_user);
    second_group.addMember(first_user);
    second_group.addMember(third_user);

    first_chat.addToGroup(first_group);
    second_chat.addToGroup(first_group);

    const models = [first_user, second_user, third_user,
        first_group, second_group, first_chat, second_chat];

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

    const models = [first_user, first_group, first_file, second_file];

    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}

module.exports = { createUpdateControllerSuite }