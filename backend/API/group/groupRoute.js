const express = require('express');

const executeRoute = require('../route');
const {createGroup, deleteGroup, updateGroup, getUsersGroups} = require('./groupController');
const {validateCreateGroup, validateDeleteGroup, validateUpdateGroup, validateGetUserGroups} = require('./groupValidation');

const router = express.Router();

router.post('/create', (request, response) => executeRoute(request, response, createGroup, validateCreateGroup));
router.delete('/delete', (request, response) => executeRoute(request, response, deleteGroup, validateDeleteGroup));
router.patch('/update', (request, response) => executeRoute(request, response, updateGroup, validateUpdateGroup));
router.post('/user_groups', (request, response) => executeRoute(request, response, getUsersGroups, validateGetUserGroups));

module.exports = router;