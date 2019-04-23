const { createAuthControllerSuite, createAuthValidationSuite } = require('./auth/authTests');
const { createAuthRouteSuite } = require('./auth/authRouteTests');
const { createGroupControllerSuite, createGroupValidationSuite } = require('./group/groupTests');
const { createGroupRouteSuite } = require('./group/groupRouteTests');
const { createChatControllerSuite, createChatValidationSuite } = require('./chat/chatTests');
const { createChatRouteSuite } = require('./chat/chatRouteTests');
const { createUpdateControllerSuite } = require('./update/updateTests');
const { createFileControllerSuite, createFileValidationSuite } = require('./file/fileTests');
<<<<<<< HEAD
const { createFileRouteSuite } = require('./file/fileRouteTests');
=======
const { createMessageControllerSuite, createMessageValidationSuite } = require('./message/messageTests');
const { createMessageRouteSuite} = require('./message/messageRouteTests');
>>>>>>> 0d6ae12b0a4f968a1a8961247f3f2d7cc02acea2
const { TestSuite } = require('./test_suite');
const {app, server} = require('../API/index');

const suite = new TestSuite('app tests', [
    createAuthControllerSuite(),
    createAuthValidationSuite(),
    createAuthRouteSuite(),
    createGroupControllerSuite(),
    createGroupValidationSuite(),
    createGroupRouteSuite(),
    createChatControllerSuite(),
    createChatValidationSuite(),
    createChatRouteSuite(),
    createFileControllerSuite(),
    createFileValidationSuite(),
<<<<<<< HEAD
    createFileRouteSuite(),
    createUpdateControllerSuite()
=======
    createChatRouteSuite(),
    createMessageControllerSuite(),
    createMessageValidationSuite(),
    createMessageRouteSuite()
>>>>>>> 0d6ae12b0a4f968a1a8961247f3f2d7cc02acea2
]);
TestSuite.executeTestSuite(suite, server);
