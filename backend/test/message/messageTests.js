const { Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel, ChatModel, MessageModel, resetInsertIds } = require('../models');
const controller = require('../../API/message/messageController');
const validator = require('../../API/message/messageValidation');
const { expect } = require('../test_suite');

function createMessageControllerSuite(){
    return new TestSuite('chatContoller.js',[
        sendMessageTests(),
        getMessageInChatTests()
    ]);
}

function createMessageValidationSuite(){
    return new TestSuite('messageValidation.js',[
        validateSendMessageTests(),
        validateGetMessageInChatTests()
    ]);
}

function sendMessageTests(){
    
}