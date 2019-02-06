const jwt = require('jsonwebtoken');

const db = require('../API/db');
const Inserter = require('./inserter');
const models = require('./models');

async function startConnection(){
    const conn_res = await db.connectToDb();
    if (conn_res.isError()) throw new Error('could not connect. Error: '+conn_res.getError());
    return conn_res.getParam('connection');
}

async function recreateDb(connection, models){
    await resetDb(connection);
    await populateDb(connection, models);
}

async function resetDb(connection){
    if (process.env.DB_TYPE === 'Production') throw new Error('attempted to wipe production db');

    const query = 'DELETE FROM Users; ALTER TABLE Users AUTO_INCREMENT = 0'
    const result = await db.queryDb(connection, query);
    if (result.isError()) throw new Error('error in clearing database '+result.getError());

    models.UserModel.insert_id = 0;
    return result;
} 

async function populateDb(connection, models){
    const insert = new Inserter(models, connection);
    insert.executeInsert();
}

function getToken(token_model){
    if (!(token_model instanceof UserModel)) throw new Error('cannot get a token from a non-UserModel');
    return jwt.sign({ userId : id }, process.env.SECRET, { expiresIn: "1h" });
}

module.exports = { startConnection, recreateDb, getToken }