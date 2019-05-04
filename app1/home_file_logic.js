// file editor logic
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

function getGroupFiles(groupID)
{
  var userToken = localStorage.getItem('token');
  //var groupID = localStorage.getItem('group_id');
  var URL = 'http://73.153.45.13:8080/file/group_files'; 

  var test_data =
    {
      group_id : Number(groupID),
      token : userToken
    };
    console.log('Get files json: '+JSON.stringify(test_data));
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
        console.log('group files: '+apiResponse);
        renderFiles(response.files);
      }
      else
      {
        var apiResponse = JSON.stringify(response);
        console.log('Non-Success: ', apiResponse);
        alert("Could not fetch group files");
      }
      

    })
    .catch(error => console.log('Error: ', error));
}

function addFile()
{
  var userToken = localStorage.getItem('token');
  var groupID = localStorage.getItem('group_id');
  var fileName = document.getElementById('file_name').value;
  var content = document.getElementById('md_input').value;
  var URL = 'http://73.153.45.13:8080/file/create'; 
  var data = {group_id : Number(groupID), file_name : fileName, file_content : content, token : userToken};
  console.log(data);
  var status;
  fetch(URL, { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}})
  .then(res => { status = res.status; return res.json();})
  .then(response => {
    if(status == 200)
    {
      var apiResponse = JSON.stringify(response);
      console.log('file ID: '+apiResponse.file_id);  
      getGroupFiles(groupID);         
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
      alert("Could not create files");
    }
  })
  .catch(error => console.log('Error: ', error));
}

function editFile()
{
   var fileID = localStorage.getItem('file_ID');
  var fileName = document.getElementById('file_name').value;
  var content = document.getElementById('md_input').value;
  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/file/update'; 
  var data = {file_id : Number(fileID), file_name : fileName, file_content : content, token: userToken};
  fetch(URL, { method: 'PATCH', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}})
  .then(res => { status = res.status; return res.json();})
  .then(response => {
    if(status == 200)
    {
      var apiResponse = JSON.stringify(response);   
      document.getElementById('file_message').innerHTML = 'file saved';  
      setTimeout(clearFileMessage, 2000);     
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
      alert("Could not save file");
    }
  })
  .catch(error => console.log('Error: ', error));
}

function deleteFile()
{
  var fileID = localStorage.getItem('file_ID');
  var userToken = localStorage.getItem('token');
  var groupID = localStorage.getItem('group_id');
  var URL = 'http://73.153.45.13:8080/file/delete'; 
  var data = {token : userToken, file_id : Number(fileID), group_id : Number(groupID)};
  console.log(data);
  var status;
  fetch(URL, { method: 'DELETE', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}})
  .then(res => { status = res.status; return res.json();})
  .then(response => {
    if(status == 200)
    {
      document.getElementById('file_message').innerHTML = 'file deleted'; 
      clearEditor(); 
      getGroupFiles(groupID);
      setTimeout(clearFileMessage, 2000); 
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
      alert("Could not delete file");
    }
  })
  .catch(error => console.log('Error: ', error));
}

function renderFiles(data)
{
  // group_files
  document.getElementById('group_files').innerHTML='<hr>';
  var content = '';
  for(var i =0; i < data.length; i++)
  {
    content += '<button onclick="loadFile('+data[i].FileID+')">'+data[i].FileName+'</button><br>'
  }
  console.log(content);
  document.getElementById('group_files').innerHTML+=content;
}

function loadFile(fileID)
{
  localStorage.setItem('file_ID', fileID);
  var userToken = localStorage.getItem('token');
  var URL = 'http://73.153.45.13:8080/file/get_by_id'; 
  var data = {token : userToken, file_id : Number(fileID)};
  var status;
  fetch(URL, { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}})
  .then(res => { status = res.status; return res.json();})
  .then(response => {
    if(status == 200)
    {
      var apiResponse = JSON.stringify(response);
      document.getElementById('file_name').value = response.file.FileName;
      document.getElementById('md_input').value = response.file.FileContent;           
    }
    else
    {
      var apiResponse = JSON.stringify(response);
      console.log('Non-Success: ', apiResponse);
      alert("Could not create files");
    }
  })
  .catch(error => console.log('Error: ', error));
}

function clearFileMessage()
{
  document.getElementById('file_message').innerHTML = '';
}

function clearEditor()
{
  document.getElementById('file_name').value = '';
  document.getElementById('file_name').placeholder = 'filename.txt ...';
  document.getElementById('md_input').value = 'Type **Markdown** here.';
}