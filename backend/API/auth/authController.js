const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { queryDb } = require('../db');
const { Success, Error } = require('../common');

const { createGroup } = require('../group/groupController');

//tests
// - valid
// - nonexistent user
// - invalid pass
async function login(body, connection){
    const { name, password } = body;
    const result = await getUser(connection, name);
    if (result.isError()) return result;
    if (result.isEmpty()) return new Error(401, 'authentication failed');
    const id = result.getDataValue('UserID');

    const valid = await bcrypt.compare(password, result.getDataValue('Password'));
    if (!valid) return new Error(401, 'authentication failed');

    const token = jwt.sign({ user_id : id }, 'secret', { expiresIn: "1h" });
    return new Success({token, user_id : id});
}

async function signUp(body, connection){
    const { name, screen_name, password } = body;
    const enc_password = await bcrypt.hash(password, 10);
    if(!enc_password) return new Error(500, 'password encryption failed');

    const query = `INSERT INTO Users (UserName, ScreenName, Password) VALUES (?,?,?);`;
    const result = await queryDb(connection, query, [name, screen_name, enc_password]);

    if (result.isError()) return result;

    //we need to create a personal group for each user so that they can keep personal files
    const group_res = await createGroup({user_id : result.getAddedRowId(), group_name: 'personal'}, connection);
    if (group_res.isError()) return result;


    else return new Success({id : result.getAddedRowId()});
}

async function getUser(connection, name){
    const query = `SELECT * FROM Users WHERE UserName = ?`;
    return result = await queryDb(connection, query, name);
}

//need some tests 
// - null user id
// -exists
// -doesnt exist
async function userExists(user_id, connection){
    if (user_id == null) false;
    const query = `SELECT COUNT(*) AS Count FROM Users WHERE UserId = ?;`
    const result = await queryDb(connection, query, user_id);
    if (result.isError()) return false;
    return (result.getData()[0].Count === 1);
}

function tokenValid(token){
    try{
        const decoded = jwt.verify(token, 'secret');
        return {valid : true, user_id : decoded.userId};
    }
    catch (error){
        return {valid : false, user_id : null};
    }
}

module.exports = { login, signUp, getUser, tokenValid, userExists }