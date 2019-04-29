const { createAuthControllerSuite, createAuthValidationSuite } = require('./auth/authTests');
const { createAuthRouteSuite } = require('./auth/authRouteTests');
const { createGroupControllerSuite, createGroupValidationSuite } = require('./group/groupTests');
const { createGroupRouteSuite } = require('./group/groupRouteTests');
const { createChatControllerSuite, createChatValidationSuite } = require('./chat/chatTests');
const { createChatRouteSuite } = require('./chat/chatRouteTests');
const { createUpdateControllerSuite } = require('./update/updateTests');
const { createFileControllerSuite, createFileValidationSuite } = require('./file/fileTests');
const { createFileRouteSuite } = require('./file/fileRouteTests');
const { createMessageControllerSuite, createMessageValidationSuite } = require('./message/messageTests');
const { createMessageRouteSuite} = require('./message/messageRouteTests');
const { TestSuite } = require('./test_suite');
const {app, server} = require('../API/index');

const suite = new TestSuite('app tests', [
    /*createAuthControllerSuite(),
    createAuthValidationSuite(),
    createAuthRouteSuite(),
    createGroupControllerSuite(),
    createGroupValidationSuite(),*/
    createGroupRouteSuite(),
    /*createChatControllerSuite(),
    createChatValidationSuite(),
    createChatRouteSuite(),
    createFileControllerSuite(),
    createFileValidationSuite(),
    createFileRouteSuite(),
    createUpdateControllerSuite(),
    createMessageControllerSuite(),
    createMessageValidationSuite(),
    createMessageRouteSuite()*/
]);
TestSuite.executeTestSuite(suite, server);
