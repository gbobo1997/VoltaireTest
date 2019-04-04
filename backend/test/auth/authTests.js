const { expect, Test, TestSuite, assertSuccess, assertError } = require('../test_suite');
const { TestModels, UserModel, resetInsertIds } = require('../models');
const controller = require('../../API/auth/authController');
const group_controller = require('../../API/group/groupController');
const validator = require('../../API/auth/authValidation');

function createAuthControllerSuite(){
    return new TestSuite('authController.js', [
        loginTests(),
        signUpTests(),
        userExistsTests()
    ]);
}

function createAuthValidationSuite(){
    return new TestSuite('authValidation.js', [
        validateLoginTests(),
        validateSignUpTests()
    ]);
}

function loginTests(){
    const models = getDbModels();

    return new TestSuite('login', [
        new Test('logs in a user given a valid user', models, async (connection) =>{
            const result = await controller.login({name : 'name', password: 'test'}, connection);
            
            assertSuccess(result);
            expect(result.getParams()).to.have.property('token');
            expect(result.getParams()).to.have.property('user_id');
            expect(result.getParams().user_id).to.equal(1);
        }),
        new Test('does not log in if the user does not exist', models, async (connection) =>{
            const result = await controller.login({name : 'name4', password : 'pass'}, connection);
            assertError(result, 401, 'authentication failed');
        }),
        new Test('does not log in if the password is incorrect', models, async (connection) =>{
            const result = await controller.login({name : 'name', password : 'pass2'}, connection);
            assertError(result, 401, 'authentication failed');
        })
    ])
}

function signUpTests(){
    const models = getDbModels();

    return new TestSuite('signUp', [
        new Test('successfuly creates a user when correct parameteres are given', models, async (connection) =>{
            const result = await controller.signUp({name : 'new_name', screen_name : 'screen', password : 'pass'}, connection);
            assertSuccess(result, {id : 4});

            const user_result = await controller.userExists(4, connection);
            expect(user_result).to.be.true;

            const group_result = await group_controller.getUsersGroups({user_id : 4}, connection);
            assertSuccess(group_result, [{group_name: 'personal', group_id: 1}]);
        }),
        new Test('returns an error when a db error occurs (given a null parameter)', models, async (connection) =>{
            const result = await controller.signUp({name : 'new_name', screen_name : null, password : 'pass'}, connection);
            assertError(result, 500, 'database error');
        })
    ]);
}

function userExistsTests(){
    const models = getDbModels();

    return new TestSuite('userExists', [
        new Test('returns true given an existing user', models, async (connection) =>{
            const result = await controller.userExists(1, connection);
            expect(result).to.be.true;
        }),
        new Test('returns false given a user that doesnt exist', models, async (connection) =>{
            const result = await controller.userExists(4, connection);
            expect(result).to.be.false;
        }),
        new Test('returns false given a null user id', models, async (connection) =>{
            const result = await controller.userExists(null, connection);
            expect(result).to.be.false;
        })
    ]);
}

function validateLoginTests(){
    const models = getDbModels();

    return new TestSuite('validateLogin', [
        new Test('successfully validates given correct parameters', models, async (connection) =>{
            const result = await validator.validateLogin({name : 'name', password :'pass'});
            assertSuccess(result, null);
        }),
        new Test('fails validation given a null parameter', models, async (connection) =>{
            const result = await validator.validateLogin({name : 'name', password : null});
            assertError(result, 400, 'invalid parameters, send the following body: {name : string, password : string}');
        })
    ])
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
            assertError(result, 400, 'invalid parameters, send the following body: {name : string, screen_name : string, password : string}');
        }),
        new Test('fails validation given a user that already exists', models, async (connection) =>{
            const result = await validator.validateSignUp({name: 'name', screen_name: 'screen4', password: 'test4'}, connection);
            assertError(result, 400, 'user with the same name already exists');
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