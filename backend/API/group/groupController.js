const { queryDb } = require('../db');
const { Success, Error } = require('../common');
const updater = require('../update/updateController');

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

//lots of tests are needed. yay
async function inviteUserToGroup(body, connection){
    const { user_id, invitee_id, group_id } = body;
    //get the name of the user who sent the invite
    var query = 'SELECT ScreenName FROM Users WHERE UserID = ?';
    var user_result = await queryDb(connection, query, user_id);
    if (user_result.isError()) return user_result;
    if (user_result.isEmpty()) return new Error(400, 'user is not in the database');
    const screen_name = user_result.getDataValue('ScreenName');

    query = 'INSERT INTO GroupInvites (UserID, GroupID, SenderName) VALUES (?, ?, ?)'; 
    var result = await queryDb(connection, query, [invitee_id, group_id, screen_name]);
    if (result.isError()) return result;
    return new Success();
}

//wow look we need more tests
async function respondToInvitation(body, connection){
    const { user_id, group_id, confirmed } = body;

    var query = 'DELETE FROM GroupInvites WHERE UserID = ? AND GroupID = ?';
    var result = await queryDb(connection, query, [user_id, group_id]);
    if (result.isError()) return result;

    if (confirmed){
        var query = 'INSERT INTO GroupMembers (GroupID, UserID) VALUES (?, ?)';
        var result = await queryDb(connection, query, [group_id, user_id]);
        if (result.isError()) return result;
    }

    return new Success();
}

//need to write tests
async function getUsersInGroup(group_id, connection){
    var query = 'SELECT UserID, ScreenName FROM GroupMembers OUTER JOIN GroupMembers.UserID = Users.UserID WHERE GroupID = ?';

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
    const query = 'SELECT COUNT(*) AS Count FROM ChatGroup WHERE GroupID = ?';
    const result = await queryDb(connection, query, group_id);
    if (result.isError() || result.isEmpty()) return false;
    return (result.getData()[0].Count === 1);
}

//tests
// - null params
// - is a member
// - is not a member
// - user does not exist
// - group does not exist 
async function userIsAGroupMember(group_id, user_id, connection){
    if (group_id == null || user_id == null) return false;
    const query = 'SELECT COUNT(*) As Count FROM GroupMembers WHERE GroupID = ? AND UserID = ?';
    const result = await queryDb(connection, query, [group_id, user_id]);
    if (result.isError()) return false;
    return (result.getData()[0].Count === 1);
}

//tests bois
async function userHasBeenInvitedToGroup(group_id, user_id, connection){
    if (group_id == null || user_id == null) return false;
    const query = 'SELECT COUNT(*) As Count FROM GroupInvites WHERE UserID = ? AND GroupID = ?';
    const result = await queryDb(connection, query, [user_id, group_id]);
    if (result.isError()) return false;
    return (result.getDataValue('Count') === 1);
}

module.exports = { createGroup, deleteGroup, updateGroup, getUsersGroups, getUsersInGroup, groupExists, userIsAGroupMember, inviteUserToGroup, respondToInvitation, userHasBeenInvitedToGroup }