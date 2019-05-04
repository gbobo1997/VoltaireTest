// UI functions
function addGroup()
{
  var content = '<label>Group Name:</label><input type="text" name="groupName" '+
  'value="group name" id="new_groupName"><button type="button" onclick="addGroupFetch()">Create</button><br><div id="error" style="text-align:center; font-size=125%;'+
  ' color:red;">Error: error type</div>';
  openModal(content);

}

function editGroup(groupID, groupName)
{
  var content = '<label>Current Group Name:</label><input type="text" id="newGroupName" '+
  'value="'+groupName+'"><button type="button" onclick="patchGroup('+groupID+')">Change</button><button type="button"'+
  ' onclick="deleteGroup('+groupID+')">Delete</button><br><div id="error" style="text-align:center; font-size=125%;'+
  ' color:red;"></div>';
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
  var content =  '<label> Invites: </label><br><div id="group_invites">'+
  '</div><br><button type="button" onclick="renderUserIDDialog()">Get your ID</button>';
  openModal(content);
  getUserInvitations();
}

function renderUserIDDialog()
{
  var content = '<center><form><label>Email:</label><input type="text" name="uName" id="uName" required><br><label>Password:</label><input type="password" name="password" id="pWord" required><br><button type="button" onclick="loginConfirm()">Login</button></form><div id="error_display"></div></center>';
  openModal(content);
}
function displayID(ID)
{
  var content = '<label>User ID: </label>'+ID;
  openModal(content);
}
function loginConfirm()
{
  var username = document.getElementById("uName").value;
  var password = document.getElementById("pWord").value;
  var URL = 'http://73.153.45.13:8080/auth/login';
  var bodyData = {name: username, password: password};
  var status = '';
  fetch(URL, {method: 'POST',body: JSON.stringify(bodyData),headers :{ 'Content-Type':'application/json'}
  })
  .then(res => {status = res.status;return res.json();})
  .then(response => {
    if(status == 200)
    {
      var apiResponse = JSON.stringify(response); 
      console.log(apiResponse);
      displayID(response.user_id);
    }
    else
    {
      // update the user
      document.getElementById("error_display").innerHTML = '<br><b>Invalid login<b>';
      window.setTimeout(clearErrorDiv, 2000);
    }
    
  })
  .catch(error => console.log('Error: ', error))
}