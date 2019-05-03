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
    +data.groups[i].group_name+'</i></button><br></div>';
    content+= '<button id="addChat" onclick="createChat('+data.groups[i].group_id+')">└ add chat</button>'; 
  }
  document.getElementById('columnOne_two').innerHTML+=content;
}

function renderGroup(groupID)
{
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