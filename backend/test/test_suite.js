const chai = require('chai');
const chaiHttp = require('chai-http');
const deep_equal = require('deep-equal-in-any-order');

const expect = chai.expect;
chai.use(chaiHttp);
chai.use(deep_equal);

const test_db = require('./testdb');
const { Success, Error, QueryResult } = require('../API/common');

class TestSuite{
    constructor(description, tests){
        this.description = description;
        this.tests = tests;
    }

    static executeTestSuite({description, tests}, server){
        describe(description, function(){
            tests.forEach((test) =>{
                test.constructor.executeTest(test);
            });

            after(function(done){
                server.close();
                done();
            })
        });
    }

    static executeTest({description, tests}){
        describe(description, function(){
            tests.forEach((test) =>{
                test.constructor.executeTest(test);
            });
        });
    }
}

class Test{
    constructor(description, {models, token_model}, func){
        this.description = description;
        this.models = models;
        this.token_model = token_model;
        this.internal_function = func;
    }

    static executeTest({description, models, token_model, internal_function}){
        it(description, async function(){
            const connection = await test_db.startConnection();
            await test_db.recreateDb(connection, models);
    
            if(token_model == null) await internal_function(connection);
            else{
                const token = test_db.getToken();
                await internal_function(connection, token)
            }
            connection.end();
        });
    }
}

function assertRouteResult(result, code, body=false){
    expect(result).to.have.status(code);
    if (body !== false) assertEquals(result.body, body);
}

function assertRouteError(result, code, message){
    expect(result).to.have.status(code);
    assertEquals(result.body.message, message);
}

function assertError(err, code, message){
    expect(err).to.be.an.instanceOf(Error);
    expect(err.getCode()).to.equal(code);
    expect(err.getParams().message).to.equal(message);
}

function assertSuccess(success, body=false){
    expect(success).to.be.an.instanceOf(Success);
    if (body !== false) assertEquals(success.getParams(), body);
}

function assertQueryResult(result, data=false){
    expect(result).to.be.an.instanceOf(QueryResult);
    if (data !== false) assertEquals(result.getData(), data);
}

function assertEquals(a,b){
    expect(a).to.deep.equalInAnyOrder(b);
}

module.exports = { chai, expect, Test, TestSuite, assertRouteResult, assertRouteError, assertError, assertSuccess, assertQueryResult, assertEquals }