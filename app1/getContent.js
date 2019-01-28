
var writePath = '';
function getContent()
{
	var path = window.location.hash.substring(1);
	console.log('Text: '+path.length);
	if(path.length > 2)
	{
		writePath = path;
		var fs = require('fs');
		var text = fs.readFileSync(path);
		document.getElementById("text-input").innerHTML= text;
	}
}

function writeContent()
{
	var localPath = '';
	var text = document.getElementById("text-input").value;
	// If editing a file
	if(writePath.length > 1)
	{
		fs.writeFile(writePath, text, function(err){
			if(err) {
				return console.log(err);
			}
		});
	}
	// If new file
	else
	{
		localPath = document.getElementById("fileName").value;
		localPath = '/home/robert/Documents/'+localPath+'.txt';
		fs.writeFile(localPath, text, function(err){
			if(err) {
				return console.log(err);
			}
		});

	}
	
}

getContent();
