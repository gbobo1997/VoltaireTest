/*class Handler 
{
  // We may consider using a group class as well, to handle group
  // operations but I am unsure. 
  constructor(token, user_id)
  {
    this.token = token;
    this.user_id = user_id;
  }  
  // To be written and used for the entire home.html interface
  getGroups(token)
  getGroupChats(group_id)
  changeUsername()
  changePassword()
  createGroup(grup_name)
  // etc...
}*/

// On run we want to generate the handler object by retrieving the token/user_id from the 
// session storage. Because everything we do requires a token, we should route our
// arguments via methods within a class where that token is an attribute, 
// this is a good application of OOP. 
// let current_user = Handler(a,b);
var markdown = require( "markdown" ).markdown;
listGroups();
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
  document.getElementById('output').innerHTML += document.getElementById('tInput').value;
  document.getElementById('tInput').value= '';
}

function addGroup()
{
  document.getElementById('delete').type = 'hidden';       
  modal.style.display = "block"; 
  //alert("Group name already taken.");

}

function deleteGroup(groupID)
{
  document.getElementById(groupID).innerHTML = '';
}

//test by austin

function editGroup()
{
  addGroup();
  document.getElementById('groupNameForm').value = currentGroup;    
  document.getElementById('gsb').value = 'Edit'; 
  document.getElementById('delete').type = 'Submit'; 

}

// Create Chat
function createChat()
{
  var content = '<label>Groups: </label><select><option value="test">Group1</option><option'+
  ' value="test2">Group2</option></select><label>Chat Name: </label><input id="newChatName" '+
  'value="chat name"></form><button type="button" onlick="">Create Chat</button><br>'+
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

function listGroups()
{
  // would be used on document run to make an api call and load all user associated groups into first column
  // will just do static for now
  // was gonna use tuples here but JS doesnt have it ???
  var content;
  var testGroups = ['School', 'Work', 'Gaming'];
  var tGImages = ['unco_logo_bear.jpg', 'google.jpg', '1_up.jpg'];
  var i;
  for (i = 0; i < testGroups.length; i++)
  {
      content+='<div id="'+testGroups[i]+'" onclick="changeGroup('+testGroups[i]+')">';
      content+= '<img style="border-radius: 50%; height: 50px; width: 50px;" src="images/'+tGImages[i]+'" alt="Avatar"><br>'+testGroups[i]+'<br>';
      content+='<hr></div>';
  }
  document.getElementById('columnOne').innerHTML+='<br><br>'+content;
}

function changeGroup(group)
{
  currentGroup = group;
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
  addMessage("Austen", 'incoming', 'this is a new incoming message.');
}
addMessage("Austen", 'outgoing', 'this is a new incoming message.');
addMessage("Robert", 'incoming', 'this is a new message.');
var toggleCount = 0;
function togglePreview()
{
  toggleCount++;
  // check if even, if even -> want editor
  // if odd -> want preview
  if(toggleCount%2 == 0)
  {
    console.log("even show editor");
    // hide preview
    document.getElementById("md_preview").style.display = "none";
    document.getElementById("md_preview").innerHTML = "";

    // toggle editor    
    document.getElementById("md_editor").style.display = "block";
  }
  else
  {
    console.log("odd show preview");
    html_content = markdown.toHTML(document.getElementById("md_input").value);
    // hide editor
    document.getElementById("md_editor").style.display = "none";
    // toggle preview
    document.getElementById("md_preview").style.display = "block";
    document.getElementById("md_preview").innerHTML = html_content;
  }
}



