const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { queryDb } = require('../db');
const { Success, Error } = require('../common');

async function verifyPassword(connection, name, password){
    const result = await getUser(connection, name);
    if (result.isError()) return result;
    if (result.isEmpty()) return new Error(401, 'authentication failed');

    const valid = await bcrypt.compare(result[0].Password, password);
    if (!valid) return new Error(401, 'authentication failed');

    return new Success({id : result[0].UserID});
}

function createToken(id){
    const token = jwt.sign({ userId : id }, process.env.SECRET, { expiresIn: "1h" });
    return new Success({token});
}

async function signUp(connection, name, screen_name, password){
    const enc_password = await bcrypt.hash(password, 10);
    if(!enc_password) return null;

    const query = `INSERT INTO Users VALUES (?,?,?);`;
    const result = await queryDb(connection, query, [name, screen_name, enc_password]);

    if (result.isError()) return result;
    else return new Success({id : result.insertId});
}

async function getUser(connection, name){
    const query = `SELECT * FROM Users WHERE UserName = ?`;
    return result = await queryDb(connection, query, name);
}

module.exports = { verifyPassword, createToken, signUp, getUser }