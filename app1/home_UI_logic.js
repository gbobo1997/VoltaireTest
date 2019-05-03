// UI functions
function addGroup()
{
  var content = '<label>Group Name:</label><input type="text" name="groupName" '+
  'value="group name" id="new_groupName"><button type="button" onclick="addGroupFetch()">Create</button><br><div id="error" style="text-align:center; font-size=125%;'+
  ' color:red;">Error: error type</div>';
  openModal(content);

}

function editGroup()
{
  var content = '<label>Current Group Name:</label><input type="text" name="groupName" '+
  'value="group name"><button type="button" onclick="">Change</button><button type="button"'+
  ' onclick="">Delete</button><br><div id="error" style="text-align:center; font-size=125%;'+
  ' color:red;">Error: error type</div>';
  openModal(content);

}

// Create Chat
function createChat(group_id)
{
  var content = 'Chat Name: </label><input id="newChatName" '+
  'value="chat name"></form><button type="button" onclick="postChat('+group_id+')">Create Chat</button><br>'+
  '<div id="error" style="text-align:center; font-size=125%; color:red; display:none;">'+
  'Error: error type</div>';
  openModal(content);
}

function editChat()
{
  var content = '<label>Current Chat Name:</label><input type="text" name="chatName" '+
  'value="chat name"><button type="button" onclick="">Change</button><button type="button"'+
  ' onclick="">Delete</button><br><div id="error" style="text-align:center; font-size=125%;'+
  ' color:red;">Error: error type</div>';
  openModal(content);
}

function userOptions() 
{
  var content = '<label>Username: </label><input type="text" id="" value="current username">'+
  '<br><label>Other Attributes: </label><input type="text" id="" value="eh">';
  openModal(content);
}

function openModal(content)
{
  document.getElementById('groupAction').innerHTML = content;
  modal.style.display = "block"; 
}

function clearErrorDiv()
{
  document.getElementById("error").innerHTML = '';
}

function logout()
{
  // clear all local storage
  localStorage.clear();
  localStorage.setItem('user_id', 'not_logged_in');
  window.location.href = 'index.html';
}

function renderInvite(groupID)
{
  var content = '<label>Invitee ID: </label><input type="text" id="invite_id" placeholder="id ...">'+
  '<br><button type="button" onclick="groupInvite('+groupID+')">Send Invite</button><br><div id="invite_error"></div>';
  openModal(content);
}

function modalInvites() 
{
  
}