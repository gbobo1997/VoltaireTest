const { createAuthControllerSuite, createAuthValidationSuite } = require('./auth/authTests');
const { createAuthRouteSuite } = require('./auth/authRouteTests');
const { createGroupControllerSuite, createGroupValidationSuite } = require('./group/groupTests');
const { createGroupRouteSuite } = require('./group/groupRouteTests');
const { TestSuite } = require('./test_suite');
const {app, server} = require('../API/index');

const suite = new TestSuite('app tests', [
    createAuthControllerSuite(),
    createAuthValidationSuite(),
    createAuthRouteSuite(),
    createGroupControllerSuite(),
    createGroupValidationSuite(),
    createGroupRouteSuite()
]);
TestSuite.executeTestSuite(suite, server);
