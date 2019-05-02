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