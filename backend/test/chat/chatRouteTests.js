const { chai, expect, Test, TestSuite, assertRouteResult, assertRouteError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, ChatModel, resetInsertIds } = require('../models');
const {app} = require('../../API/index');

function createChatRouteSuite(){
    return new TestSuite('chatRoute.js', [
        createCreateChatTests(),
        createDeleteChatTests(),
        createUpdateChatTests(),
        createGetChatInGroupTests()
    ]);
}

function createCreateChatTests(){
    const models = getDbModels(1);

    return new TestSuite('POST /create', [
        new Test('it should create a chat when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/chat/create')
                .send({token : token, group_id: 1, chat_name : 'test'});
            
            assertRouteResult(result, 200, {group_id : 4});
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/chat/create')
                .send({token : token, group_id: 1, chat_name : null});
        
            assertRouteError(result, 400, 'invalid parameters, send the following body: {chat_name : string, token : token}');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/chat/create')
                .send({token : token.split("").reverse().join(""), group_id: 1, chat_name : 'test'});
            
            assertRouteError(result, 401, 'token invalid');
        })
    ]);
}

function createDeleteChatTests(){
    const models = getDbModels(1);

    return new TestSuite('DELETE /delete', [
        new Test('it should delete a chatwhen given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/chat/delete')
                .send({chat_id : 1, token : token});
            
            assertRouteResult(result, 200);
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/chat/delete')
                .send({goup_id : 2, token : token});
        
            assertRouteError(result, 400, 'user is not a member of the group');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/chat/delete')
                .send({chat_id : 1, token : token.split("").reverse().join("")});
            
            assertRouteError(result, 401, 'token invalid');
        })
    ]);  
}

function createUpdateChatTests(){
    const models = getDbModels(1);

    return new TestSuite('PATCH /update', [
        new Test('it should update a chat name when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .patch('/chat/update')
                .send({chat_id : 1, token : token, chat_name : 'test'});
            assertRouteResult(result, 200);
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .patch('/chat/update')
                .send({chat_id : 5, token : token, chat_name : 'test'});
        
            assertRouteError(result, 400, 'group does not exist');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .patch('/chat/update')
                .send({chat_id : 1, token : token.split("").reverse().join(""), chat_name : 'test'});
            
            assertRouteError(result, 401, 'token invalid');
        })
    ]);
}


function getDbModels(token_id=null){
    resetInsertIds();

    const first_user = new UserModel('name', 'screen', 'test');
    const second_user = new UserModel('name2', 'screen2', 'test2');
    const third_user = new UserModel('name3', 'screen3', 'test3');

    const first_group = new GroupModel('name');
    const second_group = new GroupModel('name2');

    const first_chat = new ChatModel('chat');
    const second_chat = new ChatModel('chat2');
    const third_chat = new ChatModel('chat3');

    first_group.addMember(first_user);
    first_group.addMember(second_user);
    second_group.addMember(third_user);

    first_chat.addToGroup(first_group);
    second_chat.addToGroup(second_group);
    third_chat.addToGroup(second_group);

    const models = [first_user, second_user, third_user,
        first_group, second_group, first_chat, second_chat, third_chat];

    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}

module.exports = { createChatRouteSuite };