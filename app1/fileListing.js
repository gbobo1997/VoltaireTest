var testFolder = '/home/robert/Documents';
const fs = require('fs');
const path = require('path');

var content = [];
var fullContent = [];

initContent();
getContent(testFolder);

function getContent(directory)
{
  content = [];
  fs.readdir(directory, (err, files) => 
  {
    files.forEach(file => 
    {
      
        content.push(file);
      
    });
    //document.getElementById("listFiles2").innerHTML+='<form id="fileForms" action="index.html">';
   for(i = 0; i < content.length; i++)
   {
    var fileName = '';
    var filePath = '';

    var folderName = '';
    var folderPath = '';

    // Content strings for generating html content
    // that matches the folder or file requirement
    var folderString = '';
    var fileString = '';

    if(content[i].includes('.txt')||content[i].includes('.md')||!content[i].includes('.'))
      {
        // Plan: create button or link entity with the folder 
        // as a passed value

        // Or for files include button to open file in app

        // folder ops
        if(!content[i].includes('.'))
        {
          folderName = content[i];
          folderPath = directory + '/'+folderName;
          folderString = '<div id="'+folderName+'">'+folderName+'<button id="'+folderPath+'" onclick="openFolder()">Open Folder</button></div>';
          document.getElementById("listFolders").innerHTML+=folderString;
        }

        // file ops
        
        if(content[i].includes('.'))
        {
          fileName = content[i];
          filePath = directory+'/'+fileName;
          fileString = '<div id="'+fileName+'">'+fileName+'<button id="'+filePath+'" onclick="openFile()">Open File</button></div>';
          //fileString = fileName + '<input type="submit" value="Submit"><input type="hidden" name="filePath" value="'+filePath+'>"<br>';
          document.getElementById("listFiles2").innerHTML+=fileString;
        }            
        //document.getElementById("listFiles").innerHTML += content[i]; 
      }
   }
   //document.getElementById("listFiles2").innerHTML+='</form>';
  });
}

function openFolder()
{
  var path = event.srcElement.id;
  testFolder = path;
  console.log('Path: '+path);
  clearContent();
  //setTimeout(getContent(path), 1000);
  
  initContent();
  getContent(path);
  // Elements not clearing properly??
  // See if they arent clearing or if its another issue

}

function openFile()
{
  var path = event.srcElement.id;
  console.log('File Path: '+path);

  window.location.href = 'index.html'+'#'+path;

  // Need to figure out post 
  // want to post the file path to the index page
  // index page listens for post, gets the location 
  // and loads the location content into the textbox on init
  /*
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "index.html", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    filePath: path
}));*/
}

function clearContent()
{
  var listFolders = document.getElementById("listFolders");
  var listFiles2 = document.getElementById("listFiles2");
  var listFiles = document.getElementById("listFiles");
  var check = document.getElementById("check");
  listFolders.parentNode.removeChild(listFolders);
  listFiles2.parentNode.removeChild(listFiles2);
  listFiles.parentNode.removeChild(listFiles);
  check.parentNode.removeChild(check);

  var body = document.getElementById("mainContainer");
  body.parentNode.removeChild(body);
}

function initContent()
{
  document.getElementById("body").innerHTML = '<div id="mainContainer"><div id="listFiles">Files: </div><div id="check"></div><div id="listFolders">Folders: </div><div id="listFiles2">Files: </div></div>';
}