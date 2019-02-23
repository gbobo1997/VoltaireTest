const { queryDb } = require('../db');
const { Success, Error } = require('../common');

async function createGroup(body, connection){
    const {user_id, group_name} = body;
    var query = 'INSERT INTO ChatGroup (GroupName) VALUES (?)';

    var result = await queryDb(connection, query, group_name);
    if (result.isError()) return result;
    const group_id = result.getAddedRowId();

    query = 'INSERT INTO GroupMembers (GroupID, UserID) VALUES (?, ?)';
    result = await queryDb(connection, query, [group_id, user_id]);
    if (result.isError()) return result;

    return new Success({group_id : group_id});
}

async function deleteGroup(body, connection){
    const { group_id } = body;
    var query = 'DELETE FROM GroupMembers WHERE GroupID = ?';

    var result = await queryDb(connection, query, group_id);
    if (result.isError()) return result;

    query = 'DELETE FROM ChatGroup WHERE GroupID = ?';
    result = await queryDb(connection, query, group_id);
    if (result.isError()) return result;
    return new Success();
}

async function updateGroup(body, connection){
    const { group_id, group_name } = body;
    var query = 'UPDATE ChatGroup SET GroupName = ? WHERE GroupID = ?';
    
    var result = await queryDb(connection, query, [group_name, group_id]);
    if (result.isError()) return result;
    return new Success();
}

async function getUsersGroups(body, connection){
    const { user_id } = body;
    var query = `SELECT GroupMembers.GroupID, GroupName FROM GroupMembers \
                    INNER JOIN ChatGroup ON ChatGroup.GroupID = GroupMembers.GroupID
                    WHERE UserID = ?`;
    var result = await queryDb(connection, query, user_id);
    if (result.isError()) return result;
    return new Success(result.getData());
}

module.exports = { createGroup, deleteGroup, updateGroup, getUsersGroups }