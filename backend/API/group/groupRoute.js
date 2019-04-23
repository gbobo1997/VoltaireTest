const express = require('express');

const executeRoute = require('../route');
const {createGroup, deleteGroup, updateGroup, getUsersGroups, inviteUserToGroup, respondToInvitation} = require('./groupController');
const {validateCreateGroup, validateDeleteGroup, validateUpdateGroup, validateGetUserGroups, valdiateInviteUserToGroup, validateRespondToinvitation} = require('./groupValidation');

const router = express.Router();

router.post('/create', (request, response) => executeRoute(request, response, createGroup, validateCreateGroup));
router.delete('/delete', (request, response) => executeRoute(request, response, deleteGroup, validateDeleteGroup));
router.patch('/update', (request, response) => executeRoute(request, response, updateGroup, validateUpdateGroup));
router.post('/user_groups', (request, response) => executeRoute(request, response, getUsersGroups, validateGetUserGroups));
//tests for the below
router.post('/invite', (request, response) => executeRoute(request, response, inviteUserToGroup, valdiateInviteUserToGroup));
router.post('/respond', (request, response) => executeRoute(request, response, respondToInvitation, validateRespondToinvitation));

module.exports = router;