const { chai, expect, Test, TestSuite, assertRouteResult, assertRouteError, assertSuccess } = require('../test_suite');
const { TestModels, UserModel, GroupModel, resetInsertIds } = require('../models');
const controller = require('../../API/group/groupController');
const {app} = require('../../API/index');

function createGroupRouteSuite(){
    return new TestSuite('groupRoute.js', [
        createCreateGroupTests(),
        createDeleteGroupTests(),
        createUpdateGroupTests(),
        createGetUserGroupsTests(),
        inviteUserToGroupTests(),
        respondToInvitationTests()
    ]);
}

function createCreateGroupTests(){
    const models = getDbModels(1);

    return new TestSuite('POST /create', [
        new Test('it should create the group when given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/create')
                .send({token : token, user_id: "user_id", group_name : 'test'});
            
            assertRouteResult(result, 200, {group_id : 4});
        }),
        new Test('it should return a validation error given incorrect input', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/create')
                .send({token : token, group_name : null});
        
            assertRouteError(result, 400, 'invalid parameters, send the following body: {group_name : string, token : token}');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/create')
                .send({token : token.split("").reverse().join(""), group_name : 'test'});
            
            assertRouteError(result, 401, 'token invalid');
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
                .send({group_id : 2, token : token});
        
            assertRouteError(result, 400, 'user is not a member of the group');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .delete('/group/delete')
                .send({group_id : 1, token : token.split("").reverse().join("")});
            
            assertRouteError(result, 401, 'token invalid');
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
        
            assertRouteError(result, 400, 'group does not exist');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .patch('/group/update')
                .send({group_id : 1, token : token.split("").reverse().join(""), group_name : 'test'});
            
            assertRouteError(result, 401, 'token invalid');
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
        
                assertRouteError(result, 400, 'invalid parameters, send the following body: {token : token}');
        }),
        new Test('it should return a auth error given incorrect credentials', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/user_groups')
                .send({user_id : 2, token : token.split("").reverse().join("")});
            
                assertRouteError(result, 401, 'token invalid');
        })
    ]);
}

function inviteUserToGroupTests(){
    const models = getDbModels(3);

    return new TestSuite('POST /invite', [
        new Test('it should invite the user to the group given correct parameters', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/invite')
                .send({token : token, invitee_id : 1, group_id : 3});

                assertRouteResult(result, 200);
        }),
        new Test('it should return a validation error given incorrect input (a string instead of an int)', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/invite')
                .send({token : token, invitee_id : 'one', group_id : 3});

                assertRouteError(result, 400, 'invalid parameters, send the following body: {token : token, invitee_id : int, group_id : int}');
        }),
        new Test('it should return a validation given other erroneous input (invitee is already a member of the group', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/invite')
                .send({token : token, invitee_id : 1, group_id : 1});

                assertRouteError(result, 400, 'invitee is already a member of the group');
        }),
        new Test('it should return an auth error gien an invalid token', models, async (c, token) =>{
            const result = await chai.request(app)
                .post('/group/invite')
                .send({token : token.split("").reverse().join(""), invitee_id : 1, group_id : 3})

                assertRouteError(result, 401, 'token invalid');
        })
    ])
}

function respondToInvitationTests(){
    const models = getDbModels(1);

    return new TestSuite('POST /respond', [
        new Test('it should respond to an invitation given correct parameters', models, async (c, token) =>{
            const invite_result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, c);
            assertSuccess(invite_result, null);

            const result = await chai.request(app)
                .post('/group/respond')
                .send({token : token, confirmed : false, group_id : 3});

                assertRouteResult(result, 200);
        }),
        new Test('it should return a validation error given incorrect input (a string instead of a bool)', models, async (c, token) =>{
            const invite_result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, c);
            assertSuccess(invite_result, null);
            
            const result = await chai.request(app)
                .post('/group/respond')
                .send({token : token, confirmed : 'false', group_id : 3});

                assertRouteError(result, 400, 'invalid parameters, send the following body: {token : token, confirmed : bool, group_id : int}');
        }),
        new Test('it should return a validation given other erroneous input (user has not been invited to the group)', models, async (c, token) =>{
            const invite_result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 2}, c);
            assertSuccess(invite_result, null);
            
            const result = await chai.request(app)
                .post('/group/respond')
                .send({token : token, confirmed : false, group_id : 3});

                assertRouteError(result, 400, 'user has not been invited to the group');
        }),
        new Test('it should return an auth error gien an invalid token', models, async (c, token) =>{
            const invite_result = await controller.inviteUserToGroup({user_id: 3, invitee_id: 1, group_id: 3}, c);
            assertSuccess(invite_result, null);
            
            const result = await chai.request(app)
                .post('/group/respond')
                .send({token : token.split("").reverse().join(""), confirmed : false, group_id : 3})

                assertRouteError(result, 401, 'token invalid');
        })
    ])
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