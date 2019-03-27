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
    if (group_id === undefined || group_name === undefined) return new Error(500, 'database error');

    var result = await queryDb(connection, query, [group_name, group_id]);
    if (result.isError()) return result;
    return new Success();
}

async function getUsersGroups(body, connection){
    const { user_id } = body;
    var query = `SELECT GroupMembers.GroupID AS group_id, GroupName As group_name FROM GroupMembers \
                    INNER JOIN ChatGroup ON ChatGroup.GroupID = GroupMembers.GroupID
                    WHERE UserID = ?`;
    var result = await queryDb(connection, query, user_id);
    if (result.isError()) return result;
    return new Success(result.getData());
}

//need to write tests
async function getUsersInGroup(group_id, connection){
    var query = 'SELECT UserID FROM GroupMembers WHERE GroupID = ?';

    var result = await queryDb(connection, query, group_id);
    if (result.isError()) return result;
    return new Success(result.getData());
}

//tests
// - null group id
// -exists
// -does not exist
async function groupExists(group_id, connection){
    if (group_id == null) return false;
    const query = 'SELECT COUNT(*) FROM ChatGroup WHERE Group_ID = ?';
    const result = await queryDb(connection, query, group_id);
    if (result.isError()) return false;
    return new result.getData() === 1;
}

//tests
// - null params
// - is a member
// - is not a member
// - user does not exist
// - group does not exist 
async function userIsAGroupMember(group_id, user_id, connection){
    if (group_id == null || user_id == null) return false;
    const query = 'SELECT COUNT(*) FROM GroupMembers WHERE GroupID = ? AND UserID = ?';
    const result = await queryDb(connection, query, [group_id, user_id]);
    if (result.isError()) return false;
    return result.getData() === 1;
}

module.exports = { createGroup, deleteGroup, updateGroup, getUsersGroups, getUsersInGroup, groupExists, userIsAGroupMember }