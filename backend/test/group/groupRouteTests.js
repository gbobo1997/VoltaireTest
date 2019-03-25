const { chai, expect, Test, TestSuite, assertRouteResult, assertRouteError } = require('../test_suite');
const { TestModels, UserModel, GroupModel, resetInsertIds } = require('../models');
const {app} = require('../../API/index');

function createGroupRouteSuite(){
    return new TestSuite('groupRoute.js', [
        createCreateGroupTests(),
        createDeleteGroupTests(),
        createUpdateGroupTests(),
        createGetUserGroupsTests()
    ]);
}

function createCreateGroupTests(){
    const models = getDbModels(1);

    return new TestSuite('POST /create', [
        new Test('it should create the group when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/create')
                .send({user_id : 1, token : token, group_name : 'test'});
            
            assertRouteResult(result, 200, {group_id : 4});
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/create')
                .send({user_id : 2, token : token, group_name : 'test'});
        
            assertRouteError(result, 400, 'tried to create a group for another user');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/create')
                .send({user_id : 1, token : token.split("").reverse().join(""), group_name : 'test'});
            
            assertRouteError(result, 401, 'auth error');
        })
    ]);
}

function createDeleteGroupTests(){
    const models = getDbModels(1);

    return new TestSuite('DELETE /delete', [
        new Test('it should delete the group when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/group/delete')
                .send({group_id : 1, token : token});
            
            assertRouteResult(result, 200);
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/group/delete')
                .send({goup_id : '2', token : token});
        
            assertRouteError(result, 400, 'validation error');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/group/delete')
                .send({group_id : 1, token : token.split("").reverse().join("")});
            
            assertRouteError(result, 401, 'auth error');
        })
    ]);
}

function createUpdateGroupTests(){
    const models = getDbModels(1);

    return new TestSuite('PATCH /update', [
        new Test('it should update the group name when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .patch('/group/update')
                .send({group_id : 1, token : token, group_name : 'test'});
            assertRouteResult(result, 200);
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .patch('/group/update')
                .send({group_id : 5, token : token, group_name : 'test'});
        
            assertRouteError(result, 400, 'the user is not a member of the group or group does not exist');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .patch('/group/update')
                .send({group_id : 1, token : token.split("").reverse().join(""), group_name : 'test'});
            
            assertRouteError(result, 401, 'auth error');
        })
    ]);
}

function createGetUserGroupsTests(){
    const models = getDbModels(1);

    return new TestSuite('POST /user_groups', [
        new Test('it should create the group when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/user_groups')
                .send({user_id : 1, token : token});
            assertRouteResult(result, 200, [{group_id: 1, group_name: 'name'}]);
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/user_groups')
                .send({user_id : 2, token : null});
        
                assertRouteError(result, 400, 'validation error');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/user_groups')
                .send({user_id : 2, token : token});
            
                assertRouteError(result, 400, 'tried to get groups from another user');
        })
    ]);
}

function getDbModels(token_id=null){
    resetInsertIds();

    const first_user = new UserModel('name', 'screen', 'test');
    const second_user = new UserModel('name2', 'screen2', 'test2');
    const third_user = new UserModel('name3', 'screen3', 'test3');

    const first_group = new GroupModel('name');
    const second_group = new GroupModel('name2');
    const third_group = new GroupModel('name3');

    first_group.addMember(first_user);
    first_group.addMember(second_user);
    first_group.addMember(third_user);
    second_group.addMember(second_user);
    second_group.addMember(third_user);
    third_group.addMember(third_user);

    const models = [first_user, second_user, third_user,
        first_group, second_group, third_group];

    if (token_id === null) return new TestModels(models);
    else return new TestModels(models, models[token_id-1]);
}

module.exports = { createGroupRouteSuite }