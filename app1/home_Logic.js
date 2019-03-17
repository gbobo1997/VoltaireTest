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


var loremIpsum = require('lorem-ipsum');
var output = loremIpsum(
  {
    count: 10,
    units: 'paragraphs'
  }
);
//document.getElementById("output").innerHTML += output;
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
  alert("Group name already taken.");

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