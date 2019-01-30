const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

async function verifyPassword(connection, name, password){
    const query = `SELECT * FROM Users WHERE UserName = ?`;

    const result = await db.queryDb(connection, query, name);
    if (!result || result.length === 0) return null;

    const valid = await bcyrpt.compare(result[0].Password, password);
    if (!valid) return null;

    return result[0].UserID;
}

function createToken(id){
    return jwt.sign({ userId : id },process.env.SECRET,{ expiresIn: "1h" });
}

module.exports = { verifyPassword, createToken }