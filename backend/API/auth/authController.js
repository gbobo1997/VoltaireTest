const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

async function verifyPassword(connection, name, password){
    const result = await getUser(connection, name);
    if (!result || result.length === 0) return null;

    const valid = await bcrypt.compare(result[0].Password, password);
    if (!valid) return null;

    return result[0].UserID;
}

function createToken(id){
    return jwt.sign({ userId : id }, process.env.SECRET, { expiresIn: "1h" });
}

async function signUp(connection, name, screen_name, password){
    const query = `INSERT INTO Users VALUES (?,?,?)`;
    const result = await db.queryDb(connection, query, [name, screen_name, password]);

    return (result) ? result.insertId : null;
}

async function getUser(connection, name){
    const query = `SELECT * FROM Users WHERE UserName = ?`;
    return result = await db.queryDb(connection, query, name);
}

module.exports = { verifyPassword, createToken, signUp, getUser }