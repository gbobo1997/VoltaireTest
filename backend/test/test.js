const { createAuthControllerSuite, createAuthValidationSuite } = require('./auth/authTests');
const { createAuthRouteSuite } = require('./auth/authRouteTests');
const { createGroupControllerSuite, createGroupValidationSuite } = require('./group/groupTests');
const { createGroupRouteSuite } = require('./group/groupRouteTests');
const { createUpdateControllerSuite } = require('./update/updateTests');
const { createFileControllerSuite } = require('./file/fileTests');
const { TestSuite } = require('./test_suite');
const {app, server} = require('../API/index');

const suite = new TestSuite('app tests', [
    //createAuthControllerSuite(),
    //createAuthValidationSuite(),
    //createAuthRouteSuite(),
    createGroupControllerSuite(),
    //createGroupValidationSuite(),
    //createGroupRouteSuite(),
    //createUpdateControllerSuite(),
    //createFileControllerSuite()
]);
TestSuite.executeTestSuite(suite, server);
