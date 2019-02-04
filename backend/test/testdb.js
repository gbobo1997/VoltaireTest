const jwt = requrie('jsonwebtoken');

const db = require('../API/db');
const Inserter = require('./inserter');
const models = require('./models');

async function handleConnection(test_suite){
    const conn_res = await db.connectToDb();
    if (conn_res.isError()) throw new Error('could not connect. Error: '+conn_res.getError());

    const connection = conn_res.getParam('connection');
    test_suite(connection);
    connection.end();
}

async function recreateDb(connection, models){
    await this.clearDb(connection);
    await this.resetAutoIncrement(connection);
    await this.populateDb(connection, models);
}

async function clearDb(connection){
    if (process.env.DB_TYPE === 'Production') throw new Error('attempted to wipe production db');

    const query = 'DELETE FROM Users;'
    const result = await db.queryDb(connection, query);
    if (result.isError()) throw new Error('error in clearing database '+result.getError());
    return result;
} 

async function resetAutoIncrement(connection){
    const query = 'ALTER TABLE Users AUTO_INCREMENT = 0';
    const result = await db.queryDb(connection, query);
    if (result.isError()) throw new Error('error in resetting auto-increment '+result.getError());

    models.UserModel.insert_id = 0;
}

async function populateDb(connection, models){
    const insert = new Inserter(models, connection);
    insert.executeInsert();
}

function getToken(token_model){
    if (!(token_model instanceof UserModel)) throw new Error('cannot get a token from a non-UserModel');
    return jwt.sign({ userId : id }, process.env.SECRET, { expiresIn: "1h" });
}

module.exports = { handleConnection, recreateDb, getToken }