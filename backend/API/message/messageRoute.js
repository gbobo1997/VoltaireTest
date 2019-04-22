const express = require('express');

const executeRoute = require('../route');
const {sendMessage, getMessagesInChat, getRecentMessages} = require('./messageController');
const {validateSendMessage, validateGetMessageInChat, validateGetRecentMessages} = require('./messageValidation');

const router = express.Router();

router.post('/send', (request, response) => executeRoute(request, response, sendMessage, validateSendMessage));
router.post('/messages', (request, response) => executeRoute(request, response, getMessagesInChat, validateGetMessageInChat));
router.post('/reent_messages', (request, response) => executeRoute(request, response, getRecentMessages, validateGetRecentMessages));

module.exports = router;

