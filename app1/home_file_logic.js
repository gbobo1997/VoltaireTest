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

function getGroupFiles()
{
  var userToken = localStorage.getItem('token');
  var groupID = localStorage.getItem('group_id');
  var URL = 'http://73.153.45.13:8080/file/group_files'; 

  var test_data =
    {
      group_id : groupID,
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
  var data = {group_id : groupID, file_name : fileName, file_content : content, token : userToken};
  console.log(data);
  var status;
  fetch(URL, { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}})
  .then(res => { status = res.status; return res.json();})
  .then(response => {
    if(status == 200)
    {
      var apiResponse = JSON.stringify(response);
      console.log('file ID: '+apiResponse.file_id);      
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
  
}