const { chai, expect, Test, TestSuite, assertRouteResult, assertRouteError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, ChatModel, MessageModel, resetInsertIds } = require('../models');
const {app} = require('../../API/index');

function createMessageRouteSuite(){
    return new TestSuite('mesageRoute.js', [
        createSendMessageTests(),
        createGetMessagesInChatTests(),
        createGetRecentMessagesTests()
    ]);
}

function createSendMessageTests(){
    const models = getDbModels(1);

    return new TestSuite('POST /send', [
        new Test('it should send a message when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/message/send')
                .send({token : token, content : 'test', chat_id:1 });
            
            assertRouteResult(result, 200, {message_id : 4, updates:[]});
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/message/send')
                .send({token : token, content : null, chat_id:1});
        
            assertRouteError(result, 400, 'invalid parameters, send the following body: {content : string, chat_id : int, token : token}');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/message/send')
                .send({token : token.split("").reverse().join(""), content : 'test', chat_id:1});
            
            assertRouteError(result, 401, 'token invalid');
        })
    ]);
}

function createGetMessagesInChatTests(){
    const models = getDbModels(1);

    return new TestSuite('POST /messages', [
        new Test('it should retrieve messages in a chat when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/message/messages')
                .send({chat_id : 1, token : token});
            console.log(result.body);
            assertRouteResult(result, 200, {messages: [{ChatID : 1, MessageID: 1, MessageContent: 'test1', TimeSent: 1, UserID: 1, ScreenName :'screen' },
            {ChatID : 1, MessageID: 3, MessageContent: 'test3', TimeSent:3, UserID: 2, ScreenName :'screen2' }], updates: []});
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/message/messages')
                .send({chat_id : 4, token : token});
        
            assertRouteError(result, 400, 'chat does not exist');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/message/messages')
                .send({chat_id : 1, token : token.split("").reverse().join("")});
            assertRouteError(result, 401, 'token invalid');
        })
    ]);
}

function createGetRecentMessagesTests(){
    const models = getDbModels(1);

    return new TestSuite('POST /recent_messages', [
        new Test('it should retrieve messages in a chat when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/message/recent_messages')
                .send({chat_id : 1, message_id: 1, token : token});
            assertRouteResult(result, 200, {messages: [{ChatID : 1, MessageID: 3, MessageContent: 'test3', TimeSent: 3, UserID: 2, ScreenName :'screen2' }], updates: []});
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/message/recent_messages')
                .send({chat_id : 4, message_id: 1, token : token});
        
            assertRouteError(result, 400, 'chat does not exist');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/message/recent_messages')
                .send({chat_id : 1, message_id: 1, token : token.split("").reverse().join("")});
            
            assertRouteError(result, 401, 'token invalid');
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/message/recent_messages')
                .send({chat_id : 1, message_id: 5, token : token});
        
            assertRouteError(result, 400, 'message does not exist');
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
module.exports = { createMessageRouteSuite};

