const chai = require('./chai');
const chaiHttp = require('chai-http');
const deep_equal = require('deep-equal-in-any-order');

const expect = chai.expect;
chai.use(chaiHttp);
chai.use(deep_equal);

const test_db = require('./testdb');
const { Success, Error, QueryResult } = require('../API/common');

class TestSuite{
    constructor(description){
        this.description = description;
        this.tests = [];
    }

    addTests(tests){
        this.tests = tests;
    }

    async executeTestSuite(){
        describe(this.description, () =>{
            test_db.handleConnection((connection) =>{
                this.tests.forEach((test) =>{
                    await test.executeTest(connection);
                });
            });
        });
    }

    async executeTest(connection){
        describe(this.description, () =>{
            this.tests.forEach((test) =>{
                await test.executeTest(connection);
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

    async executeTest(connection){
        it(this.description, (done) =>{
            await test_db.recreateDb(connection, this.models);
    
            if(this.token_model == null) internal_function(connection);
            else{
                const token = test_db.getToken();
                await internal_function(connection, token)
            }
            done();
        });
    }
}

function assertRouteResult(err, result, code, body){
    expect(err).to.be.null;
    expect(result).to.have.status(code);
    assertEquals(result.body, body);
}

function assertError(err, code, message){
    expect(err).to.be.an.instanceOf(Error);
    expect(err.getCode()).to.equal(code);
    expect(err.getParams().message).to.equal(message);
}

function assertSuccess(success, body=null){
    expect(success).to.be.an.instanceOf(Success);
    assertEquals(success.getParams(), body);
}

function assertQueryResult(result, data){
    expect(result).to.be.an.instanceOf(QueryResult);
    assertEquals(result.getData(), data);
}

function assertEquals(a,b){
    expect(a).to.deep.equalInAnyOrder(b);
}

module.exports = { chai, Test, TestSuite, assertRouteResult, assertError, assertSuccess, assertQueryResult, assertEquals }