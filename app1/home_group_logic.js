// group functions
// get user groups on load
fetchGroups();

function fetchGroups()
{
  var userID = localStorage.getItem('user_id');
  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/group/user_groups'; 

  var test_data =
  {
    token : userToken,
    user_id : userID
  };
  var status;

  fetch(URL, 
  {
    method: 'POST',
    body: JSON.stringify(test_data),
    headers :
    {
      'Content-Type':'application/json'
    }
  })
  .then(res => {
    status = res.status;
    return res.json();})
  .then(response => {
    if(status == 200)
    {
      var apiResponse = JSON.stringify(response);
      console.log('Fetch groups success: ', apiResponse);
      //console.log(response[0].group_id);
      listGroups(response);
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
      alert("Could not fetch user groups");
    }
    

  })
  .catch(error => console.log('Error: ', error))
}


function listGroups(data)
{
  // basic output
  // group name will be a link, on link click expand list and
  // display associated chats
  // data model
  console.log('data; '+data.groups.length);
  var content = '';
  var groups_chats;
  document.getElementById('columnOne_two').innerHTML=content;
  for(var i =0; i < data.groups.length; i++)
  {
    content += '<div id="'
    +data.groups[i].group_id+'"><br><button id="group_select_btn" onclick="renderGroup('
    +data.groups[i].group_id+')"><i>'
    +data.groups[i].group_name+'</i></button>'
    +'<button id="group_edit_btn" onclick="editGroup('
    +data.groups[i].group_id+',\''+data.groups[i].group_name+'\')">#</button><br></div>';
    content+= '<button id="addChat" onclick="createChat('+data.groups[i].group_id+')">└ add chat</button>'; 
    content +='<button id="group_invite" onclick="renderInvite('+data.groups[i].group_id+')">└ invite</button>'; 
  }
  document.getElementById('columnOne_two').innerHTML+=content;
}

function renderGroup(groupID)
{
  localStorage.setItem('group_id', groupID);
  console.log("group: "+groupID);

  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/chat/chat_groups'; 

  var test_data =
  {
    group_id : groupID,
    token : userToken
  };
  var status;
  fetch(URL, 
  {
    method: 'POST',
    body: JSON.stringify(test_data),
    headers :
    {
      'Content-Type':'application/json'
    }
  })
  .then(res => {
    status = res.status;
    return res.json();})
  .then(response => {
    if(status == 200)
    {
      var apiResponse = JSON.stringify(response);
      console.log(apiResponse);
      var content = '';
      for(var i = 0; i < response.chats.length; i++)
      {
        content +='<button id="chat_button" onclick="loadChat('+response.chats[i].ChatID+','+groupID+')">'+response.chats[i].ChatName+'</button>';
      }
      
      document.getElementById(groupID).innerHTML+=content;
      getGroupFiles(groupID);
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
      alert("Could not fetch group chats");
    }
    

  })
  .catch(error => console.log('Error: ', error));
}

function addGroupFetch()
{
  var userID = localStorage.getItem('user_id');
  var userToken = localStorage.getItem('token');

  var groupName = document.getElementById('new_groupName').value;

  var URL = 'http://73.153.45.13:8080/group/create'; 

  var test_data =
  {
    token : userToken,
    user_id : userID,
    group_name : groupName
  };
  console.log(test_data);
  console.log(JSON.stringify(test_data));
  var status;

  fetch(URL, 
  {
    method: 'POST',
    body: JSON.stringify(test_data),
    headers :
    {
      'Content-Type':'application/json'
    }
  })
  .then(res => {
    status = res.status;
    return res.json();})
  .then(response => {
    if(status == 200)
    {
      var apiResponse = JSON.stringify(response);
      console.log('Success: ', apiResponse);
      fetchGroups();
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
      document.getElementById("error").innerHTML = '<br><b>Invalid Group Name<b>';
      window.setTimeout(clearErrorDiv, 2000);
    }
    

  })
  .catch(error => console.log('Error: ', error))

}

function groupInvite(groupID)
{
  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/group/invite'; 
  var invID = document.getElementById('invite_id').value;
  var data = {token : userToken, group_id : Number(groupID), invitee_id : Number(invID)};
  fetch(URL, { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}})
  .then(res => { 
    status = res.status; 
    if(status == 200)
    {
      document.getElementById('invite_error').innerHTML = 'Invite successful';  
      window.setTimeout(clearInviteMessage, 2000); 
    }
    else
    {
      //var apiResponse = JSON.stringify(response);
      //console.log('Non-Success: ', apiResponse);
      document.getElementById('invite_error').innerHTML = 'Invite unsuccessful';  
      window.setTimeout(clearInviteMessage, 2000); 
    }
  })
  .catch(error => console.log('Error: ', error));
}

function clearInviteMessage()
{
  document.getElementById('invite_error').innerHTML = '';
}

function patchGroup(groupID)
{
  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/group/update'; 
  var groupName = document.getElementById('newGroupName').value;
  var data = {token : userToken, group_id : Number(groupID), group_name : groupName};
  var status;
  fetch(URL, { method: 'PATCH', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}})
  .then(res => { status = res.status; return res.json();})
  .then(response => {
    if(status == 200)
    {
      var apiResponse = JSON.stringify(response);
      console.log(apiResponse);
      document.getElementById('error').innerHTML = 'Name Change Success';
      fetchGroups();
      setTimeout(clearErrorDiv, 2000);          
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
      document.getElementById('error').innerHTML = 'could not update group';
      setTimeout(clearErrorDiv, 2000);
    }
  })
  .catch(error => console.log('Error: ', error));
}

function deleteGroup(groupID)
{
  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/group/delete'; 
  var groupName = document.getElementById('newGroupName').value;
  var data = {token : userToken, group_id : Number(groupID)};
  var status;
  fetch(URL, { method: 'DELETE', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}})
  .then(res => { status = res.status; return res.json();})
  .then(response => {
    if(status == 200)
    {
      document.getElementById('error').innerHTML = 'Group Deleted';
      fetchGroups();
      setTimeout(clearErrorDiv, 2000);          
    }
    else
    {
      document.getElementById('error').innerHTML = 'could not update group';
      setTimeout(clearErrorDiv, 2000);
    }
  })
  .catch(error => console.log('Error: ', error));
}

function getUserInvitations()
{
  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/group/get_invites'; 
  var data = {token : userToken};
  var status;
  fetch(URL, { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}})
  .then(res => { status = res.status; return res.json();})
  .then(response => {
    if(status == 200)
    {
      var content = '';
      var invites = response.invitations;
      console.log(JSON.stringify(response));
      for(var i = 0; i < invites.length; i++)
      {
        //group_invites
        content += '<label>'+invites[i].SenderName+'</label><br><button type="button" onclick = "responseToInvite('+invites[i].GroupID+',\'true\')">Accept</button>';
        content += '<button type="button" onclick = "responseToInvite('+invites[i].GroupID+',\'\')">Decline</button><hr>';
      }
      document.getElementById('group_invites').innerHTML = content;          
    }
    else
    {
      console.log(JSON.stringify(response));
    }
  })
  .catch(error => console.log('Error: ', error));
}

function responseToInvite(groupID, c)
{
  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/group/respond'; 
  var choice = Boolean(c);
  var data = {token : userToken, confirmed : choice, group_id : Number(groupID)};
  var status;
  fetch(URL, { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}})
  .then(res => { status = res.status; return res.json();})
  .then(response => {
    if(status == 200)
    {
      getUserInvitations();
      fetchGroups();         
    }
    else
    {
      console.log(JSON.stringify(response));
    }
  })
  .catch(error => console.log('Error: ', error));
}

