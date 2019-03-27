const express = require('express');

const executeRoute = require('../route');
const {createChat, deleteChat, updateChat, getChatsInGroup} = require('./chatController');
const {validateCreateChat, validateDeleteChat, validateUpdateChat, validateGetChatInGroup} = require('./chatValidation');

const router = express.Router();

router.post('/create', (request, response) => executeRoute(request, response, createChat, validateCreateChat));
router.delete('/delete', (request, response) => executeRoute(request, response, deleteChat, validateDeleteChat));
router.patch('/update', (request, response) => executeRoute(request, response, updateChat, validateUpdateChat));
router.post('/chat_groups', (request, response) => executeRoute(request, response, getChatsInGroup, validateGetChatInGroup));

module.exports = router;