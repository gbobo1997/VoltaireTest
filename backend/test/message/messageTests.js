const { Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, GroupModel, UserModel, ChatModel, MessageModel, resetInsertIds } = require('../models');
const controller = require('../../API/message/messageController');
const validator = require('../../API/message/messageValidation');
const { expect } = require('../test_suite');

function createMessageControllerSuite(){
    return new TestSuite('chatContoller.js',[
        sendMessageTests(),
        getMessageInChatTests(),
        getRecentMessagesTests()
    ]);
}

function createMessageValidationSuite(){
    return new TestSuite('messageValidation.js',[
        validateSendMessageTests(),
        validateGetMessageInChatTests(),
        validateGetRecentMessagesTests()
    ]);
}

function sendMessageTests(){
    const models = getDbModels();

    return new TestSuite('sendMessage', [
        new Test('Successfully sends a message with given parameters', models, async (connection) =>{
            const result = await controller.sendMessage({ user_id : 1, content : 'Hello', chat_id : 2 }, connection);
            assertSuccess(result, {message_id: 4});
            const message_result = await controller.getMessageInChat({chat_id: 1},connection);
            assertSuccess(message_result, [{MessageID : 1, Content: 'test1', ChatID: 1}, {MessageID : 2, Content: 'test2', ChatID: 2}, 
            {MessageID: 3, Content: 'test3', ChatID: 1}, {MessageID : 4, Content: 'Hello_ppl', ChatID: 2}]);
        }),
        new Test('Returns a db error when given null parameters in the first query', models, async (connection) =>{
            const result = await controller.sendMessage({user_id: 2, content: 'test'}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function getMessageInChatTests(){
    const models = getDbModels();

    return new TestSuite('getMessageInChat', [
        new Test('Succesfully gets all messages in chat with given parameters', models, async (connection) => {
            const result = await controller.getMessageInChat({chat_id : 1}, connection);
            assertSuccess(result, [{ChatID : 1, MessageID: 1, Content: 'test1', TimeSent:'0001', UserID: 1, ScreenName :'screen' },
            {ChatID : 1, MessageID: 3, Content: 'test3', TimeSent:'0003', UserID: 2, ScreenName :'screen2' }]);
            }),
        new Test('gets no messages when given a chat that does not exist', models, async (connection) =>{
            const result = await controller.getMessageInChat({chat_id : 3}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error when given a null parameter', models, async (connection) =>{
            const result = await controller.getMessageInChat({chat_id : null}, connection);
            assertError(result, 500, 'database error');
            })
     ]);
}

function getRecentMessagesTests(){
    const models = getDbModels();

    return new TestSuite('getMessageInChat', [
        new Test('Succesfully gets a recent message with given parameters', models, async (connection) => {
            const result = await controller.getRecentInChat({chat_id : 1, message_id: 1}, connection);
            assertSuccess(result, [{ChatID : 1, MessageID: 3, Content: 'test3', TimeSent:'0003', UserID: 2, ScreenName :'screen2' }]);
        }),
        new Test('gets no messages when given a chat that does not exist', models, async (connection) =>{
            const result = await controller.getRecentMessagesInChat({chat_id : 3, message_id: 2}, connection);
            assertSuccess(result, []);
        }),
        new Test('gets no messages when given a message that does not exist', models, async (connection) =>{
            const result = await controller.getRecentMessagesInChat({chat_id : 2, message_id: 4}, connection);
            assertSuccess(result, []);
        }),
        new Test('returns a db error when given a null parameter', models, async (connection) =>{
            const result = await controller.getRecentMessagesInChat({chat_id : null, message_id: null}, connection);
            assertError(result, 500, 'database error');
        })
    ])
}

function validateSendMessageTests(){
    const models = getDbModels(1);
    
    return new TestSuite('validateSendMessage', [
        new Test('successfully validates given the correct parameters', models, async (connection, token) =>{
            const result = await validator.validateSendMessage({ content: 'test', chat_id : 2, token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateSendMessage({token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {content : string, chat_id : int, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateSendMessage({content: 'test', chat_id: 1, token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a non-existent chat_id', models, async(connection,token) =>{
            const result = await validator.validateSendMessage({content: 'test', chat_id: 4, token: token}, connection);
            assertError(result, 400, 'chat does not exist');
        })
    ]);
}

function validateGetMessageInChatTests(){
    const models = getDbModels(1);
    
    return new TestSuite('validateGetMessagesInChat', [
        new Test('successfully validates given the correct parameters', models, async (connection, token) =>{
            const result = await validator.validateGetMessageInChat({chat_id: 1, token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateGetMessageInChat({token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {chat_id : int, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateGetMessageInChat({chat_id: 2, token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a non-existent chat', models, async(connection,token) =>{
            const result = await validator.validateGetMessageInChat({chat_id: 4, token: token}, connection);
            assertError(result, 400, 'chat does not exist');
        })
    ]);
}

function validateGetRecentMessagesTests(){
    const models = getDbModels(1);
    
    return new TestSuite('validateGetRecentMessages', [
        new Test('successfully validates given the correct parameters', models, async (connection, token) =>{
            const result = await validator.validateGetRecentMessages({chat_id: 1, message_id: 1, token: token}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection, token) =>{
            const result = await validator.validateGetRecentMessages({token: token}, connection);
            assertError(result, 400, 'invalid parameters, send the following body: {chat_id : int, token : token}');
        }),
        new Test('fails validation given an invalid token', models, async (connection, token) =>{
            const result = await validator.validateGetRecentMessages({chat_id: 2,message_id: 2, token: token.split("").reverse().join("")}, connection);
            assertError(result, 401, 'token invalid');
        }),
        new Test('fails validation given a non-existent chat', models, async(connection,token) =>{
            const result = await validator.validateGetRecentMessages({chat_id: 4, message_id: 2, token: token}, connection);
            assertError(result, 400, 'chat does not exist');
        }),
        new Test('fails validation given a non-existent message', models, async(connection,token) =>{
            const result = await validator.validateGetRecentMessages({chat_id: 1, message_id: 5, token: token}, connection);
            assertError(result, 400, 'message does not exist');
        })

    ]);
}

function getDbModels(token_id=null){
    resetInsertIds();

    const first_user = new UserModel('name', 'screen', 'test');
    const second_user = new UserModel('name2', 'screen2', 'test2');
    

    const first_group = new GroupModel('name');
    const second_group = new GroupModel('name2');

    const first_chat = new ChatModel('chat');
    const second_chat = new ChatModel('chat2');

    const first_message = new MessageModel('test1','0001');
    const second_message = new MessageModel('test2','0002');
    const third_message = new MessageModel('test3', '0003');

    first_group.addMember(first_user);
    second_group.addMember(second_user);
    first_group.addMember(second_user);

    first_chat.addToGroup(first_group);
    second_chat.addToGroup(second_group);

    first_message.addToChat(first_chat);
    second_message.addToChat(second_chat);
    third_message.addToChat(first_chat);

    first_message.addAuthor(first_user);
    second_message.addAuthor(second_user);
    third_message.addAuthor(second_user);
    const models = [first_user, second_user,
        first_group, second_group, first_chat, 
        second_chat, first_message, second_message, third_message];

    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}
module.exports = { createMessageControllerSuite, createMessageValidationSuite};