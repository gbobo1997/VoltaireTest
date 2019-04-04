const { createAuthControllerSuite, createAuthValidationSuite } = require('./auth/authTests');
const { createAuthRouteSuite } = require('./auth/authRouteTests');
const { createGroupControllerSuite, createGroupValidationSuite } = require('./group/groupTests');
const { createGroupRouteSuite } = require('./group/groupRouteTests');
const { createChatControllerSuite, createChatValidationSuite } = require('./chat/chatTests');
const { createChatRouteSuite } = require('./chat/chatRouteTests');
const { createUpdateControllerSuite } = require('./update/updateTests');
const { createFileControllerSuite, createFileValidationSuite } = require('./file/fileTests');
const { TestSuite } = require('./test_suite');
const {app, server} = require('../API/index');

const suite = new TestSuite('app tests', [
    //createAuthControllerSuite(),
    //createAuthValidationSuite(),
    //createAuthRouteSuite(),
    //createGroupControllerSuite(),
    //createGroupValidationSuite(),
    //createGroupRouteSuite(),
    //createChatControllerSuite(),
    //createChatValidationSuite(),
    //createUpdateControllerSuite(),
    //createFileControllerSuite(),
    //createFileValidationSuite(),
    createChatRouteSuite()
]);
TestSuite.executeTestSuite(suite, server);
