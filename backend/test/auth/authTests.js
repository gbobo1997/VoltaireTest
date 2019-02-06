const { chai, Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel } = require('../models');
const controller = require('../../API/auth/authController');

function createAuthControllerSuite(){
    const suite = new TestSuite('authController.js');
    suite.addTests([
        createUserTests()
    ]);
    return suite;
}

function createUserTests(){
    const suite = new TestSuite('createUser');
    const models = getDbModels();

    suite.addTests([
        new Test('successfuly creates a user when correct parameteres are given', models, async (connection) =>{
            const result = await controller.createUser(connection, 'new_name', 'screen', 'pass');
            assertSuccess(result, {id : 4});
        }),
        new Test('returns an error when a db error occurs (given a null parameter)', models, async (connection) =>{
            const result = await controller.createUser(connection, 'name', null, 'new_pass');
            assertError(result, 500, 'database error');
        })
    ]);

    return suite;
}

function getDbModels(){
    const users = [
        new UserModel('name', 'screen', 'test'),
        new UserModel('name2', 'screen2', 'test2'),
        new UserModel('name3', 'screen3', 'test3')
    ];
    return new TestModels(users);
}

module.exports = { createAuthControllerSuite };