const chai = require('./chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

const test_db = require('./testdb');

async function executeTest(connection, desc, models, internal_function, token_model=null){
    it(desc, (done) =>{
        await test_db.recreateDb(connection, models);

        if(token_model == null) internal_function(connection);
        else{
            const token = test_db.getToken();
            internal_function(connection, token)
        }
        done();
    });
}

function assertError(err){

}

function assertSuccess(success){

}

function assertEquals(a,b){
    const result = equals(a,b);
    expect(result).to.be.true;
}

function equals(a, b){
    if (a instanceof Object && b instanceof Object) return equalsObject(a,b)
    else if (Array.isArray(a) && b.isArray(b)) return equalsArray(a,b);
    else return equalsPrimitive(a,b);
}

function equalsPrimitive(a, b){
    return a === b;
}

function equalsObject(a, b){
    const a_props = Object.keys(a);
    const b_props = Object.keys(b);
    const diff = a_props.filter(prop => !b_props.includes(prop));
    if (a_props.length !== b_props.length || diff.length === 0) return false;

    a_props.forEach(prop =>{
        if (!equals(a[prop], b[prop])) return false;
    });
    return true;
}

function equalsArray(a, b){
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    a.forEach(element =>{
        if (!b.some(e => equals(element, e))) return false;
    });
    return true;
}

module.exports = { executeTest }