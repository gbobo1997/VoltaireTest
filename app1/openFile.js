const fs = require("fs");
    document.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      
      for (let f of e.dataTransfer.files) {
        console.log('File(s) you dragged here: ', f.path)
        
        var data = fs.readFileSync(f.path);
        //document.getElementById("text-input").innerHTML= f.path;
        document.getElementById("text-input").innerHTML= data;
      }
    });
    document.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
/*
const fs = require("fs");
    document.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      
      for (let f of e.dataTransfer.files) {
        console.log('File(s) you dragged here: ', f.path)
        
        var data = fs.readFileSync(f.path);
        document.getElementById("path").innerHTML= data;
      }
    });
    document.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
*/