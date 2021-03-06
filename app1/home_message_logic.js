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
    chat_id : Number(chatID),
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
  document.getElementById('output').innerHTML = '';
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
      console.log('Message get Success: '+apiResponse);
      displayMessages(response.messages);      
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
    }

  })
  .catch(error => console.log('Error: ', error))

  
}

function displayMessages(messages)
{
  var localID = localStorage.getItem('user_id');
  var type;
  var content;
  var user;
  var messages_html = '';

  for(var i = 0; i < messages.length; i++)
  {
    user = messages[i].ScreenName;
    content = messages[i].MessageContent;
    console.log('message userId: '+messages[i].UserID+' local id: '+localID);
    if(messages[i].UserID == localID)
    {
      type = 'outgoing';
    }
    else
    {
      type = 'incoming';
    }
    if(type == 'incoming')
    {
      var newMessage = '<div id="incoming_container"><div id="message_incoming"><b>'+user+'</b><br>'+content+'</div></div>';
    }
    if(type == 'outgoing')
    {
      var newMessage = '<div id="outgoing_container"><div id="message_outgoing">'+content+'</div></div>';
    }
    messages_html+=newMessage;    
  }
  document.getElementById('output').innerHTML=messages_html;
    
}

/*for( var i = 0; i < 10; i++)
{
  addMessage("Robert", 'outgoing', 'this is a new message.');
  addMessage("Austin", 'incoming', 'this is a new incoming message.');
}
addMessage("Austin", 'outgoing', 'this is a new incoming message.');
addMessage("Robert", 'incoming', 'this is a new message.');*/