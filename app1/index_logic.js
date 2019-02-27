checkLogin();
function rdsLogin()
{
var content = '<center><h1>Welcome to Project Voltaire</h1><br><form>Username:<input type="text" name="uName" id="uName"><br>Password:<input type="text" name="password" id="pWord"><br><button type="button" onclick="loginConfirm()">Login</button></form></center>';
document.getElementById("loginArea2").innerHTML = content;
}

function rdsSignup()
{
var content = '<center><h1>Welcome to Project Voltaire</h1><br><form>Username (Email):<input type="text" name="email" id="email"><br>Password:<input type="text" name="password" id="pWord"><br><button type="button" onclick="signupConfirm()">Signup</button></form></center>';
document.getElementById("loginArea2").innerHTML = content;
}

function loginConfirm()
{
var username = document.getElementById("uName").value;
var password = document.getElementById("pWord").value;

// login url
var URL = 'http://73.153.45.13:8080/auth/login';
// login params
var bodyData = 
{
  name: username,
  password: password
};
console.log(bodyData);
// header stuff with the body data 
const otherParams = {
  headers: {
    "content-type":"application/json; charset=UTF-8"
  },
  body: JSON.stringify(bodyData),
  method: "POST"
};


/*
fetch(URL, otherParams)
.then(data=>{return data.json()})
.then(res=>{console.log('fetch 1: '+res)})
.catch(error=>console.log(error));
*/
fetch(URL, otherParams)
.then(function(response){
  console.log(response.json());
})
.then(returnData => returnData.json());
 window.location.href = 'home.html';

// Assuming the correct data is returned, this should work. 
//localStorage.setItem('user_id', res.user_id);
//localStorage.setItem('token', res.token);
}

function signupConfirm()
{
var email = document.getElementById("email").value;
var password = document.getElementById("pWord").value;
var screenName = "null for now";

// signup url
var URL = 'http://73.153.45.13:8080/auth/sign-up';
// signup params
var data = 
{
  name : email,
  screen_name: screenName,
  password: password
};
// header stuff with the body data 
const otherParams = {
  headers: {
    "content-type":"application/json; charset=UTF-8"
  },
  body: data,
  method: "POST"
};

fetch(URL, otherParams)
.then(data=>{return data.json()})
.then(res=>{console.log(res)})
.catch(error=>console.log(error))
console.log(data);

rdsLogin();
/*
fetch('http://73.153.45.13:8080/home/robert/test.json')
.then(function(response) {
  return response.json();
})
.then(function(myJson) {
  console.log(JSON.stringify(myJson));
});
.then(res => )

fetch('http://73.153.45.13:8080/home/robert/test.json')
.then(res => res.text())
.then(text => console.log(text))*/

}


function checkLogin()
{
var userID = localStorage.getItem('user_id');

if (userID != null)
{
  window.location.href = 'home.html';
}
console.log('username: '+userID);
}