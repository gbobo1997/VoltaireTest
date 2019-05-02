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