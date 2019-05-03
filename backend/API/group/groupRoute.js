const express = require('express');

const executeRoute = require('../route');
const {createGroup, deleteGroup, updateGroup, getUsersGroups, inviteUserToGroup, respondToInvitation, getAllInvitations} = require('./groupController');
const {validateCreateGroup, validateDeleteGroup, validateUpdateGroup, validateGetUserGroups, validateInviteUserToGroup, validateRespondToinvitation, validateGetAllInvitations} = require('./groupValidation');

const router = express.Router();

router.post('/create', (request, response) => executeRoute(request, response, createGroup, validateCreateGroup));
router.delete('/delete', (request, response) => executeRoute(request, response, deleteGroup, validateDeleteGroup));
router.patch('/update', (request, response) => executeRoute(request, response, updateGroup, validateUpdateGroup));
router.post('/user_groups', (request, response) => executeRoute(request, response, getUsersGroups, validateGetUserGroups));
router.post('/invite', (request, response) => executeRoute(request, response, inviteUserToGroup, validateInviteUserToGroup));
router.post('/respond', (request, response) => executeRoute(request, response, respondToInvitation, validateRespondToinvitation));
//tests
router.post('/get_invites', (request, response) => executeRoute(request, response, getAllInvitations, validateGetAllInvitations))

module.exports = router;