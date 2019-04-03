const { expect, Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, ChatModel, resetInsertIds } = require('../models');
const controller = require('../../API/chat/chatController');
const validator = require('../../API/chat/chatValidation');

function createChatControllerSuite(){
    return new TestSuite('chatController.js', [
        createChatTests(),
        deleteChatTests(),
        updateChatTests(),
        getChatsInGroupTests(),
        chatExistsTests(),
        userHasAccessToChatTests()
    ]);
}

function createChatValidationSuite(){
    return new TestSuite('chatValidation.js', [
        validateCreateChatTests(),
        validateDeleteChatTests(),
        validateUpdateChatTests(),
        valdiateGetChatsFromGroupTests()
    ]);
}

function createChatTests(){
    return new TestSuite('createChat', [

    ]);
}

function deleteChatTests(){
    return new TestSuite('deleteChat', [

    ]);
}

function updateChatTests(){
    return new TestSuite('updateChat', [

    ]);
}

function getChatsInGroupTests(){
    return new TestSuite('getChatsInGroup', [

    ]);
}

function chatExistsTests(){
    return new TestSuite('chatExists', [

    ]);
}

function userHasAccessToChatTests(){
    return new TestSuite('userHasAccessToChat', [

    ]);
}

function validateCreateChatTests(){
    return new TestSuite('validateCreateChat', [

    ]);
}

function validateDeleteChatTests(){
    return new TestSuite('validateDeleteChat', [

    ]);
}

function validateUpdateChatTests(){
    return new TestSuite('validateUpdateChat', [

    ]);
}

function valdiateGetChatsFromGroupTests(){
    return new TestSuite('validateGetChatsFromGroup', [

    ]);
}

/*
Group 1:
    - User 1
    - User 2
    - Chat 1
    - Chat 2
Group 2:
    - User 1
    - Chat 3
*/

function getDbModels(token_id=null){
    resetInsertIds();

    const first_user = new UserModel('name', 'screen', 'pass');
    const second_user = new UserModel('name2', 'screen2', 'pass2');

    const first_group = new GroupModel('name');
    const second_group = new GroupModel('name2');

    const first_chat = new ChatModel('chat');
    const second_chat = new ChatModel('chat2');
    const third_chat = new ChatModel('chat3');

    first_group.addMember(first_user);
    first_group.addMember(second_user);
    second_group.addMember(first_user);

    first_chat.addToGroup(first_group);
    second_chat.addToGroup(first_group);
    third_chat.addToGroup(second_group);

    const models = [first_user, second_user, first_group, second_group, 
        first_chat, second_chat, third_chat];
    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}

module.exports = { createChatControllerSuite, createChatValidationSuite }