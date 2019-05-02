// chat logic
function postChat(groupID)
{
  var userToken = localStorage.getItem('token');
  var chatName = document.getElementById('newChatName').value;
  var URL = 'http://73.153.45.13:8080/chat/create'; 
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
      console.log('Success: '+apiResponse);
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

function fetchGroupsChats(id)
{
  //var userID = localStorage.getItem('user_id');
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