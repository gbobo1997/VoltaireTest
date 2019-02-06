const { createAuthControllerSuite, createAuthValidationSuite } = require('./auth/authTests');
const { createAuthRouteSuite } = require('./auth/authRouteTests');
const { TestSuite } = require('./test_suite');
const {app, server} = require('../API/index');

const suite = new TestSuite('app tests', [
    createAuthControllerSuite(),
    createAuthValidationSuite(),
    createAuthRouteSuite()
]);
TestSuite.executeTestSuite(suite, server);
