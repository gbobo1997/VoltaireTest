const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { queryDb } = require('../db');
const { Success, Error } = require('../common');


// high level route controllers
async function login(body, connection){
    const verify = await verifyPassword(connection, body.name, body.password);
    if (verify.isError()) return verify;

    return createToken(verify.getParam('id'));
}

async function signUp(body, connection){
    return await createUser(connection, body.name, body.screen_name, body.password);
}


//token interaction methods
async function verifyPassword(connection, name, password){
    const result = await getUser(connection, name);
    if (result.isError()) return result;
    if (result.isEmpty()) return new Error(401, 'authentication failed');

    const valid = await bcrypt.compare(password, result.getDataValue('Password'));
    if (!valid) return new Error(401, 'authentication failed');

    return new Success({id : result.getDataValue('UserID')});
}

function createToken(id){
    const token = jwt.sign({ userId : id }, process.env.SECRET, { expiresIn: "1h" });
    return new Success({token});
}

//database interaction methods
async function createUser(connection, name, screen_name, password){
    const enc_password = await bcrypt.hash(password, 10);
    if(!enc_password) return new Error(500, 'password encryption failed');

    const query = `INSERT INTO Users (UserName, ScreenName, Password) VALUES (?,?,?);`;
    const result = await queryDb(connection, query, [name, screen_name, enc_password]);

    if (result.isError()) return result;
    else return new Success({id : result.getAddedRowId()});
}

async function getUser(connection, name){
    const query = `SELECT * FROM Users WHERE UserName = ?`;
    return result = await queryDb(connection, query, name);
}

module.exports = { login, signUp, getUser }