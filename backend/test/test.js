const { createAuthControllerSuite } = require('./auth/authTests');
const { TestSuite } = require('./test_suite');
const {app, server} = require('../API/index');

const suite = new TestSuite('app tests');
suite.addTests([
    createAuthControllerSuite()
]);
TestSuite.executeTestSuite(suite, server);
