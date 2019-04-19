const express = require('express');

const executeRoute = require('../route');
const {sendMessage, getMessagesInChat} = require('./messageController');
const {validateSendMessage, validateGetMessageInChat} = require('./messageValidation');

const router = express.Router();

router.post('/send', (request, response) => executeRoute(request, response, sendMessage, validateSendMessage));
router.delete('/get_messages', (request, response) => executeRoute(request, response, getMessagesInChat, validateGetMessageInChat));