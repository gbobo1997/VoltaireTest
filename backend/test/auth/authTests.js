const { Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel, resetInsertIds } = require('../models');
const controller = require('../../API/auth/authController');
const group_controller = require('../../API/group/groupController');
const validator = require('../../API/auth/authValidation');

function createAuthControllerSuite(){
    return new TestSuite('authController.js', [
        createUserTests(),
        verifyPasswordTests()
    ]);
}

function createAuthValidationSuite(){
    return new TestSuite('authValidation.js', [
        validateLoginTests(),
        validateSignUpTests()
    ]);
}

function createUserTests(){
    const models = getDbModels();

    return new TestSuite('createUser', [
        new Test('successfuly creates a user when correct parameteres are given', models, async (connection) =>{
            const result = await controller.createUser(connection, 'new_name', 'screen', 'pass');
            assertSuccess(result, {id : 4});

            const group_result = await group_controller.getUsersGroups({user_id : 4}, connection);
            assertSuccess(group_result, [{group_name: 'personal', group_id: 1}]);
        }),
        new Test('returns an error when a db error occurs (given a null parameter)', models, async (connection) =>{
            const result = await controller.createUser(connection, 'name', null, 'new_pass');
            assertError(result, 500, 'database error');
        })
    ]);
}

function verifyPasswordTests(){
    const models = getDbModels();

    return new TestSuite('verifyPassword', [
        new Test('successfully verifies a user given a correct login', models, async (connection) =>{
            const result = await controller.verifyPassword(connection, 'name', 'test');
            assertSuccess(result, {id : 1});
        }),
        new Test('returns an error when the user does not exist', models, async (connection) =>{
            const result = await controller.verifyPassword(connection, 'fake', 'test');
            assertError(result, 401, 'authentication failed');
        }),
        new Test('returns an error when the user exists but the password is incorrect', models, async (connection) =>{
            const result = await controller.verifyPassword(connection, 'name', 'test2');
            assertError(result, 401, 'authentication failed');
        }),
        new Test('returns an error when a db error occurs (given a null parameter', models, async (connection) =>{
            const result = await controller.verifyPassword(connection, null, 'test');
            assertError(result, 500, 'database error');
        })
    ]);
}

function validateLoginTests(){
    return new TestSuite('validateLogin', [
        new Test('successfully validates given the corrent parameters', new TestModels([]), () =>{
            const result = validator.validateLogin({name : 'name', password : 'pass'});
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', new TestModels([]), () =>{
            const result = validator.validateLogin({password : 'pass'});
            assertError(result, 400, 'validation error');
        })
    ]);
}

function validateSignUpTests(){
    const models = getDbModels();

    return new TestSuite('validateSignUp', [
        new Test('successfully validates given correct parameters', models, async (connection) =>{
            const result = await validator.validateSignUp({name : 'name4', screen_name : 'screen', password : 'test'}, connection);
            assertSuccess(result, null);
        }),
        new Test('fails validation given an incomplete parameter set', models, async (connection) =>{
            const result = await validator.validateSignUp({name : 'name4', screen_name : 'screen'}, connection);
            assertError(result, 400, 'incorrect parameters');
        }),
        new Test('fails validation given a user that already exists', models, async (connection) =>{
            const result = await validator.validateSignUp({name: 'name', screen_name: 'screen4', password: 'test4'}, connection);
            assertError(result, 400, 'user exists');
        })
    ]);
}

function getDbModels(){
    resetInsertIds();
    const users = [
        new UserModel('name', 'screen', 'test'),
        new UserModel('name2', 'screen2', 'test2'),
        new UserModel('name3', 'screen3', 'test3')
    ];
    return new TestModels(users);
}

module.exports = { createAuthControllerSuite, createAuthValidationSuite };