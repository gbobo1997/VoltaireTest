// message logic
function sendMessage()
{
  
  var content = document.getElementById('textAreaInput').value;
  document.getElementById('textAreaInput').value = '';
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