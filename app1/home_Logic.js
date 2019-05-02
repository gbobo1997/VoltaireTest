
var markdown = require( "markdown" ).markdown;
fetchGroups();
var span = document.getElementsByClassName("close")[0];
var modal = document.getElementById('myModal');  
var currentGroup = 'Home';
span.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
  //austin test

function logout()
{
  // clear all local storage
  localStorage.clear();
  window.location.href = 'index.html';
}

/* Techncally we would call this method, then pass the 
arguments to the message parser that would package
all of the needed info and then post the request to the 
webserver but for now this works as a base lol */
function sendMessage()
{
  
  var content = document.getElementById('textAreaInput').value;
  document.getElementById('textAreaInput').value = '';
}

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
  console.log(group_id);
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
      console.log('Success: ', apiResponse);
      console.log(response[0].group_id);
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

function fetchGroupsChats(id)
{
  var userID = localStorage.getItem('user_id');
  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/chat/chat_groups'; 

  var test_data =
  {
    group_id : id,
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
      console.log('Success: '+apiResponse);
      console.log('Response: '+response);
      return response;
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
      alert("Could not fetch group chats");
      var list = [];
      return list;
    }
    

  })
  .catch(error => console.log('Error: ', error))
}

function postChat(groupID)
{
  var userToken = localStorage.getItem('token');
  var chatName = document.getElementById('newChatName').value;
  var URL = 'http://73.153.45.13:8080/chat/chat_groups'; 
  console.log('what the hell');
  var test_data =
  {
    group_id : groupID,
    chat_name : chatName,
    token : userToken
  };
  console.log(test_data);
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
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
      document.getElementById("error").innerHTML = '<br><b>Invalid chat name<b>';
      window.setTimeout(clearErrorDiv, 2000);
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
  var content = '';
  var groups_chats;
  document.getElementById('columnOne_two').innerHTML=content;
  for(var i =0; i < data.length; i++)
  {
    groups_chats = fetchGroupsChats(data[i].group_id);
    content += '<br><button id="group_select_btn" value="'+data[i].group_id+'"><i>'
    +data[i].group_name+'</i></button><br>';

    if(groups_chats != null)
    {
      for(var j = 0; j < groups_chats.length; j++)
      {
        content += '<br><button id="chat_select_button" value="'+groups_chats[j].ChatID+'"<i>'
        +groups_chats[j].ChatName+'</i></button>';
      }
    }   
    content+= '<button id="addChat" onclick="createChat('+data[i].group_id+')">└ add chat</button>'; 
  }
  document.getElementById('columnOne_two').innerHTML+=content;
}


function addMessage(user, type, content)
{
  if(type == 'incoming')
  {
    var newMessage = '<div id="incoming_container"><div id="message_incoming"><b>'+user+'</b><br>'+content+'</div></div>';
  }
  if(type == 'outgoing')
  {
    var newMessage = '<div id="outgoing_container"><div id="message_outgoing"><b>'+user+'</b><br>'+content+'</div></div>';
  }
  document.getElementById('output').innerHTML+=newMessage;  
}

for( var i = 0; i < 10; i++)
{
  addMessage("Robert", 'outgoing', 'this is a new message.');
  addMessage("Austin", 'incoming', 'this is a new incoming message.');
}
addMessage("Austin", 'outgoing', 'this is a new incoming message.');
addMessage("Robert", 'incoming', 'this is a new message.');



var toggle = false;
function togglePreview()
{
  if(toggle)
  {
    //console.log("even show editor");
    // hide preview
    document.getElementById("md_preview").style.display = "none";
    document.getElementById("md_preview").innerHTML = "";

    // toggle editor    
    document.getElementById("md_editor").style.display = "block";
    toggle = false;
  }
  else
  {
    //console.log("odd show preview");
    html_content = markdown.toHTML(document.getElementById("md_input").value);
    // hide editor
    document.getElementById("md_editor").style.display = "none";
    // toggle preview
    document.getElementById("md_preview").style.display = "block";
    document.getElementById("md_preview").innerHTML = html_content;
    toggle = true;
  }
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

function clearErrorDiv()
{
  document.getElementById("error").innerHTML = '';
}

function fetchGroupFiles()
{
  
}

