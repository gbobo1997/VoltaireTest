const { chai, expect, Test, TestSuite, assertRouteResult, assertRouteError } = require('../test_suite');
const { TestModels, UserModel, resetInsertIds } = require('../models');
const {app} = require('../../API/index');

function createAuthRouteSuite(){
    return new TestSuite('authRoute.js', [
        createLoginRouteTests(),
        createSignUpRouteTests()
    ]);
}

function createLoginRouteTests(){
    const models = getDbModels();

    return new TestSuite('POST /login', [
        new Test('it should login when given correct parameters', models, async () =>{
            const result = await chai.request(app)
                .post('/auth/login')
                .send({name : 'name', password : 'test'});

            assertRouteResult(result, 200);
            expect(result.body).to.have.property('token');
        }),
        new Test('it should return a validation error given incorrect input', models, async () =>{
            const result = await chai.request(app)
                .post('/auth/login')
                .send({name : 'name', password : null})

            assertRouteError(result, 400, 'validation error');

        }),
        new Test('it should return a auth error given incorrect credentials', models, async () =>{
            const result = await chai.request(app)
                .post('/auth/login')
                .send({name : 'name', password : 'fake'})

            assertRouteError(result, 401, 'authentication failed');
        })

    ]);
}

function createSignUpRouteTests(){
    const models = getDbModels();

    return new TestSuite('POST /sign-up', [
        new Test('it should sign up successfully when given correct parameters', models, async () =>{
            const result = await chai.request(app)
                .post('/auth/sign-up')
                .send({name : 'name4', screen_name: 'screen', password : 'test'})
            
            assertRouteResult(result, 200, {id : 4});
        }),
        new Test('it should return a validation error given incorrect input', models, async () =>{
            const result = await chai.request(app)
                .post('/auth/sign-up')
                .send({name : 'name', screen_name: 'screen', password : 'now'})

            assertRouteError(result, 400, 'user exists');
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

module.exports = { createAuthRouteSuite };