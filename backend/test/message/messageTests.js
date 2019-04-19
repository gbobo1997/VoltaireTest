const { Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel, ChatModel, MessageModel, resetInsertIds } = require('../models');
const controller = require('../../API/message/messageController');
const validator = require('../../API/message/messageValidation');
const { expect } = require('../test_suite');

function createMessageControllerSuite(){
    return new TestSuite('chatContoller.js',[
        sendMessageTests(),
        getMessageInChatTests(),
        getRecentMessages()
    ]);
}

function createMessageValidationSuite(){
    return new TestSuite('messageValidation.js',[
        validateSendMessageTests(),
        validateGetMessageInChatTests(),
        validateGetRecentMessages()
    ]);
}

function sendMessageTests(){
    const models = getDbModels();

    return new TestSuite('sendMessage', [
        new Test('Successfully sends a message with given parameters', models, async (connection) =>{
            const result = await controller.sendMessage({user_id = 1, content = 'Hello_ppl', chat_id = 2 }, connection);
            assertSuccess(result, {message_id: 4});
            const message_result = await controller.getMessageInChat({chat_id: 1},connection);
            assertSuccess(message_result, [{MessageID : 1, Content: 'test1', ChatID: 1}, {MessageID : 2, Content: 'test2', ChatID: 2}, 
            {MessageID: 3, Content: 'test3', ChatID: 1}, {MessageID : 4, Content: 'Hello_ppl', ChatID: 2}]);
        }),
        new Test('Returns a db error when given null parameters in the first query', models, async (connection) =>{
            const result = await controller.sendMessage({user_id: 2, content = 'test'}, connection);
            assertError(result, 500, 'database error');
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
    first_group.addMember(second_user);
  

    first_chat.addToGroup(first_group);
    second_chat.addToGroup(second_group);

    first_message.addToChat(first_chat);
    second_message.addToChat(second_chat);
    third_message.addToChat(first_chat);


    const models = [first_user, second_user,
        first_group, second_group, first_chat, 
        second_chat, first_message, second_message, third_message];

    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}