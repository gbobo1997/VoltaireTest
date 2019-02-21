# Overview
The application is geared toward student collaboration within a team environment with a social media spin. The application will allow teams to communicate and share documents over a cloud platform, with their documents and communications saved for future reference. Teams will be able to edit documents using the same application they communicate with.  
[Read More](https://github.com/gbobo1997/VoltaireTest/blob/master/BACS487_ProjectReport_AcademicCollaborationApp.pdf)

## Planning Start Date: 9/1/2018
## Development Start Date: 2/1/2019

# Team Members
Front End:

- Robert Carver - lead

- Marleigh Cattaruzza

- Austin Carter
  
Back End: 

- Nathaniel Been - lead

- Courtney Casperson

- Tyler Marler

# Schedule
1. Login Message
    - Username - string
    - Password - string
2. Sign-up 
    - Username - string
    - Password - string
    - Name - string
3. Logout
    - clear a cookie
# Discord
https://discord.gg/F3fBd3

# Route Descriptions
## Token
Upon logging in, the backend will send a token that verifies the user's identity. Most routes will require sending a token
## Errors
Other than standard 404 errors, the back end will send 400 (validation - incorrect or invalid parameters sent), 401 (authentication - eitehr no credentials were sent or those credentials were invalid), or 500 (internal database error, something went wrong on the backend).

## Authentication
### Create An Account
**Route**: /auth/sign-up \
**In:** 
```
{
  name : string,
  screen_name : string,
  password : string
}
```
right now there are no restrictions on names or passwords (except that the name cant match another in the database)
**Out:** None (We may want to return a token here so it acts as an immediate login)

### Login
**Route:** /auth/login \
**In:**
```
{
  name : string,
  password : string
}
```
**Out:**
```
{
  token : token,
  user_id : int
}
```
