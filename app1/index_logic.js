
function rdsLogin()
{
  var content = '<center><button type="button" onclick="homeLoad()">Back</button><h1>Login</h1><br><form><label>Email:</label><input type="text" name="uName" id="uName" required><br><label>Password:</label><input type="password" name="password" id="pWord" required><br><button type="button" onclick="loginConfirm()">Login</button></form></center>';
  document.getElementById("loginArea2").innerHTML = content;
}

function rdsSignup()
{
  var content = '<center><button type="button" onclick="homeLoad()">Back</button><h1>Signup</h1><br><form><label>Screenname:</label><input type="text" name="screenName" id="screenName" required><br><label>Email:</label><input type="text" name="email" id="email"><br><label>Password:</label><input type="password" name="password" id="pWord"><br><button type="button" onclick="signupConfirm()">Signup</button></form></center>';
  document.getElementById("loginArea2").innerHTML = content;
}

function homeLoad()
{
  var content = '<center><h1>Welcome to Project Voltaire</h1><br><button type="button" onclick="rdsLogin()">Login</button>  <button type="button" onclick="rdsSignup()">Signup</button></center>';
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

  fetch(URL, {
    method: 'POST',
    body: JSON.stringify(bodyData),
    headers :
    {
      'Content-Type':'application/json'
    }
  })
  .then(res => res.json())
  .then(response => {
    var apiResponse = JSON.stringify(response);

    var token = apiResponse.token;
    var user_id = apiResponse.user_id;

    localStorage.setItem('token', token);
    localStorage.setItem('user_id', user_id);
    checkLogin();
  })
  .catch(error => console.log('Error: ', error))
  
}

function signupConfirm()
{
  var email = document.getElementById("email").value;
  var password = document.getElementById("pWord").value;
  var screenName = document.getElementById("screenName").value;

  // signup url
  var URL = 'http://73.153.45.13:8080/auth/sign-up'; 

  var test_data =
  {
    name: email,
    screen_name: screenName,
    password: password 
  };

  fetch(URL, 
  {
    method: 'POST',
    body: JSON.stringify(test_data),
    headers :
    {
      'Content-Type':'application/json'
    }
  })
  .then(res => res.json())
  .then(response => {
    var apiResponse = JSON.stringify(response);
    console.log('Success: ', apiResponse);
    localStorage.setItem('user_id', apiResponse.id);
    rdsLogin();

  })
  .catch(error => console.log('Error: ', error))

  //rdsLogin();

}


function checkLogin()
{
  var userID = localStorage.getItem('user_id');

  if (userID != null)
  {
    //window.location.href = 'home.html';
  }
  console.log('username: '+userID);
}