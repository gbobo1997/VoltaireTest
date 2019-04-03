const { Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, resetInsertIds } = require('../models');
const controller = require('../../API/chat/chatController');
const validator = require('../../API/chat/chatValidation');
const { expect } = require('../test_suite');

function createChatContollerSuite(){
    return new TestSuite('chatContoller.js',[
        createChatTests(),
        deleteChatTests(),
        updateChatTests(),
        getChatsInGroupTests(),
        chatExistsTests(),
        userHasAccessToChatTests()
    ]);
}
function createChatValidationSuite(){
    return new TestSuite('chatValidation.js',[
        validateCreateChatTests(),
        validateDeleteChatTests(),
        validateUpdateChatTests(),
        validateGetChatsFromGroupTests()
    ]);
}

function createChatTests(){
    const models = getDbModels();

    return new TestSuite('createChat', [
        new Test('Successfully creates a chat with given parameters', models, async (connection) =>{
            const result = await controller.createChat({group_id: 2, chat_name: 'test'}, connection);
            assertSuccess(result, {chat_id: 1});
            const chat_result = await controller.getChatsInGroup({group_id: 2},connection);
            assertSuccess(chat_result, [{chat_name: 'name', chat_id: 1}, {chat_name: 'test', chat_id: 1}]);
        }),
        new Test('Returns a db error when given null parameters in the first query', models, async (connection) =>{
            const result = await controller.createChat({group_id: 2}, connection);
            assertError(result, 500, 'database error');
        }),
        new Test('Returns a db error when given null parameters in the second query', models, async (connection) =>{
            const result = await controller.createChat({chat_name: 'test'}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}
function deleteChatTests(){
    const models = getDbModels();

    return new TestSuite('deleteChat', [
        new Test('Successfully deletes a chat when given correct parameters', models, async (connection) =>{
            const result = await controller.deleteChat({chat_id : 1}, connection);
            assertSuccess(result);
            const chat_result = await controller.getChatsInGroup({group_id: 2}, connection);
            assertSuccess(chat_result, []);
        }),
        new Test('Returns a db error when given null parameter',  models, async (connection) =>{
            const result = await controller.deleteChat({}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function updateChatTests(){
    const models = getDbModels();

    return new TestSuite('updateChat', [
        new Test('Successfully updates a chat name when given correct parameters', models, async (connection) =>{
            const result = await controller.updateChat({chat_id: 1, chat_name: 'test'}, connection);
            assertSuccess(result);
            const chat_result = await controller.getChatsInGroup({group_id: 2}, connection);
            assertSuccess(group_result, [{chat_id: 1, chat_name: 'test'}]);
        }),
        new Test('Returns a db error when given a null parameter', models, async (connection) =>{
            const result = await controller.updateChat({chat_name: 'test'}, connection);
            assertError(result, 500, 'database error');
        })
    ])
}

function chatExistsTests(){
    const models = getDbModels();

    return new TestSuite('chatExists', [
        new Test('Returns true given a valid chat', models, async (connection) =>{
            const result = await controller.chatExists(1, connection);
            expect(result).to.be.true;
        }),
        new Test('Returns false given a non-existant chat', models, async (connection) =>{
            const result = await controller.chatExists(4, connection);
            expect(result).to.be.false;
        }),
        new Test('Returns false given a null chat_id', models, async (connection) =>{
            const result = await controller.chatExists(null, connection);
            expect(result).to.be.false;
        })
    ]);
}

function userHasAccessToChatTests(){
    const models = getDbModels();

    return new TestSuite('userHasAccessToChat', [
        new Test('Returns true given a valid user and chat that the user is a member of', models, async (connection) =>{
            const result = await controller.userIsAGroupMember(1, 1, connection);
            expect(result).to.be.true;
        }),
        new Test('Returns false given a null parameter', models, async (connection) =>{
            const result = await controller.userHasAccessToChat(null, 1, connection);
            expect(result).to.be.false;
        }),
        new Test('Return false given a valid user and chat that the user is not apart of', models, async (connection) =>{
            const result = await controller.userHasAccessToChat(2, 1, connection);
            expect(result).to.be.false;
        }),
        new Test('Return false given a nonexistant user', models, async (connection) =>{
            const result = await controller.userHasAccessToChat(4, 1, connection);
            expect(result).to.be.false;
        }),
        new Test('Return false given a nonexistant chat', models, async (connection) =>{
            const result = await controller.userHasAccessToChat(1, 4, connection);
            expect(result).to.be.false;
        })
    ]);
}

function validateCreateChatTests(){
    const models = getDbModels(1);
    
    return new TestSuite('validateCreateChat', [
        new Test('successfully validates given the correct parameters', models, async (connection, token) =>{
            const result = await validator.validateCreateChat({group_id: 2, chat_name : 'test', token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateCreateChat({token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {group_id: int, chat_name : string, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateCreateChat({group_id: 2, chat_name: 'test', token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a non-existent group_id', models, async(connection,token) =>{
            const result = await validator.validateCreateChat({group_id: 4, chat_name: 'test', token: token}, connection);
            assertError(result, 400, 'group does not exist');
        })
    ]);
}

function validateDeleteChatTests(){
    const models = getDbModels(1);
    
    return new TestSuite('validateCreateChat', [
        new Test('successfully validates given the correct parameters', models, async (connection, token) =>{
            const result = await validator.validateDeleteChat({chat_id: 1, token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateDeleteChat({token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {chat_name : string, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateDeleteChat({chat_id: 1, token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a non-existent chat', models, async(connection,token) =>{
            const result = await validator.validateDeleteChat({chat_id: 4, token: token}, connection);
            assertError(result, 400, 'chat does not exist');
        })
    ]);
}

function validateUpdateChatTests(){
    const models = getDbModels(1);
    
    return new TestSuite('validateUpdateChat', [
        new Test('successfully validates given the correct parameters', models, async (connection, token) =>{
            const result = await validator.validateUpdateChat({chat_id: 1, chat_name : 'test', token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateUpdateChat({token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {chat_name : string, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateUpdateChat({chat_id: 2, chat_name: 'test', token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a non-existent chat_id', models, async(connection,token) =>{
            const result = await validator.validateCreateChat({chat_id: 4, chat_name: 'test', token: token}, connection);
            assertError(result, 400, 'chat does not exist');
        })
    ]);
}
    
function validateUpdateChatTests(){
    const models = getDbModels(1);
    
    return new TestSuite('validateUpdateChat', [
        new Test('successfully validates given the correct parameters', models, async (connection, token) =>{
            const result = await validator.validateUpdateChat({chat_id: 1, chat_name : 'test', token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateUpdateChat({token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {chat_name : string, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateUpdateChat({chat_id: 2, chat_name: 'test', token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a non-existent chat_id', models, async(connection,token) =>{
            const result = await validator.validateCreateChat({chat_id: 4, chat_name: 'test', token: token}, connection);
            assertError(result, 400, 'chat does not exist');
        })
    ]);
}

function validateGetChatsFromGroupTests(){
    const models = getDbModels(1);
    
    return new TestSuite('validateUpdateChat', [
        new Test('successfully validates given the correct parameters', models, async (connection, token) =>{
            const result = await validator.validateUpdateChat({group_id: 1, token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateUpdateChat({token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {chat_name : string, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateUpdateChat({group_id: 2, token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a non-existent group_id', models, async(connection,token) =>{
            const result = await validator.validateCreateChat({group_id: 5, token: token}, connection);
            assertError(result, 400, 'chat does not exist');
        })
    ]);
}
// chat 1
// - group 1
// chat 2 
// - group 2
// chat 3
// - group 2
// chat 4
// - group 3 
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