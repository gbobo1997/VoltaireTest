const express = require('express');

const executeRoute = require('../route');
const {getFile, getGroupFiles, createFile, deleteFile, updateFile, deleteFileLock, requestFileLock} = require('./fileController');
const {validateCreateFile, validateFileIdTokenRoute, validateUpdateFile, validateGetGroupFiles} = require('./fileValidation');

const router = express.Router();

router.post('/get_by_id', (request, response) => executeRoute(request, response, getFile, validateFileIdTokenRoute));
router.post('/create', (request, response) => executeRoute(request, response, createFile, validateCreateFile));
router.patch('/update', (request, response) => executeRoute(request, response, updateFile, validateUpdateFile));
router.delete('/delete', (request, response) => executeRoute(request, response, deleteFile, validateFileIdTokenRoute));
router.post('/group_files', (request, response) => executeRoute(request, response, getGroupFiles, validateGetGroupFiles));
router.post('/lock', (request, response) => executeRoute(request, response, requestFileLock, validateFileIdTokenRoute));
router.delete('/delete_lock', (request, response) => executeRoute(request, response, deleteFileLock, validateFileIdTokenRoute));

module.exports = router;