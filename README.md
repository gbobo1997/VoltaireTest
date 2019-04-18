## To-Do
### Back-end
* finish file routes and file route tests
* finish messages and message tests 
* note: group invite update, timer update 
* update routes on the readme

### Front end
* implement updated API on web-server
* write correct fetch requests for everything
* update UI (specifically group bar)
* generate message presentation schema and message requests
* timer for update requests (chat messages and file IO)
* test... 

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

# Discord
https://discord.gg/F3fBd3

# Route Descriptions
## Token
Upon logging in, the backend will send a token that verifies the user's identity. Most routes will require sending a token
## Errors
Other than standard 404 errors, the back end will send 400 (validation - incorrect or invalid parameters sent), 401 (authentication - eitehr no credentials were sent or those credentials were invalid), or 500 (internal database error, something went wrong on the backend).

## Authentication
### Testing Status: Complete
### Create An Account
**Route**: POST /auth/sign-up \
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
**Route:** POST /auth/login \
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
## Groups 
### Testing Status: Complete
### Create a Group
**Route:** POST /group/create \
**In:**
```
{
  token : token,
  user_id : int,
  group_name : string
}
```
**Out:**
```
{
  group_id : int
}
```

### Delete a Group
**Route:** DELETE /group/delete \
**In:**
```
{
  token : token,
  group_id : int
}
```
**Out:** no outgoing data

### Change a group's name
**Route:** PATCH /group/update \
**In:**
```
{
  token : token,
  group_id : int,
  group_name : string
}
```
**Out:** no outgoing data

### Get all of a user's groups
**Route:** POST /group/user_groups \
**In:**
```
{
  token : token,
  user_id : int
}
```
**Out:** 
```
{
  [
    group_id : int,
    group_name : string
  ]
}
```
