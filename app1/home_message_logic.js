// message logic
function sendMessage()
{
  var userID = localStorage.getItem('user_id');
  var chatID = localStorage.getItem('chat_id');
  var content = document.getElementById('textAreaInput').value;
  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/message/send';
  var test_data =
  {
    user_id : userID,
    chat_id : chatID,
    content : content,
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
      getMessages();
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
    }

  })
  .catch(error => console.log('Error: ', error))
  document.getElementById('textAreaInput').value = '';
}

function getMessages()
{
  var chatID = localStorage.getItem('chat_id');
  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/message/messages';
  var user;
  var type;
  var content;
  var test_data =
  {
    chat_id : Number(chatID),
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
      for( var i = 0; i <= response.length; i++)
      {
        user = apiResponse[i].user_id;
        if(apiResponse[i].user_id == localStorage.getItem('user_id'))
        {
          type = 'outgoing';
        }
        else
        {
          type = 'incoming';
        }
        content = apiResponse[i].content;
      }
  displayMessages(user, type, content);
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
    }

  })
  .catch(error => console.log('Error: ', error))

  
}

function displayMessages(user, type, content)
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

/*for( var i = 0; i < 10; i++)
{
  addMessage("Robert", 'outgoing', 'this is a new message.');
  addMessage("Austin", 'incoming', 'this is a new incoming message.');
}
addMessage("Austin", 'outgoing', 'this is a new incoming message.');
addMessage("Robert", 'incoming', 'this is a new message.');*/