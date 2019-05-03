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
**Out:**
```
{
  id : int
}
```

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
### Testing Status: Complete except for group invite routes
### Create a Group
**Route:** POST /group/create \
**In:**
```
{
  token : token
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
  token : token
}
```
**Out:** 
```
{
  groups: [
    group_id : int,
    group_name : string
  ]
}
```

### Invite a User to a group
**Route:** POST /group/invite \
**In:** 
```
{
  token : token,
  group_id : int,
  invitee_id : int (id of person you are inviting to the group)
}
```
**Out:** NONE

### Accept or Decline an invitation
**Route:** POST /group/respond
**In:** 
```
{
  token : token,
  group_id : int,
  confirmed : bool (True to accept invitation, False to reject it)
}
```
**Out:** NONE

## File
### Testing Status: Completed
### Get a File
**Route:** POST /file/get_by_id \
**In:**
```
{
  token : token,
  file_id : int
}
```
**Out:**
```
{
  file: {
    FileID : int,
    GroupID : int,
    FileName : string,
    FileContent : string,
    ScreenName : string,
    Expires : int (Unix time code)
  }
}
```

### Create a File
**Route:** POST /file/create
**In:**
```
{
  group_id : int,
  file_name : string,
  file_content : string,
  token : token
}
```
**Out:**
```
{
  file_id : int
}
```

### Delete a File
**Route:** DELETE /file/delete \
**In:**
```
{
  token : token,
  file_id : int
}
```

**Out:** None

### Update a file (content and/or name)
**Route:** PATCH /file/update \
**In:**
```
{
  file_id : int,
  file_name : string,
  file_content : string,
  token : token
}
```
**Out:**
```
{
  expiration : int (unix time code)
}
```

### Get Files from a Group
**Route:** POST /file/group_files \
**In:**
```
{
  group_id : int,
  token : token
}
```
**Out:**
```
{
  files : [
    FileID : int,
    FileName : string
  ]
}
```

### Request a lock on a file
**Route:** POST /file/lock \
**In:**
```
{
  file_id : int,
  token : token
}
```
**Out:**
```
{
  expiration : string (YYY-MM-DD HH:mm:SS)
}
```

### Release your own lock on a file
**Route:** DELETE /file/delete_lock \
**In:**
```
{
  file_id : int,
  token : token
}
```
**Out:** NONE

## Chat
### Testing Status: Complete
### Create a Chat
**Route:** POST /chat/create \
**In:**
```
{
  group_id : int,
  chat_name : string,
  token : token
}
```
**Out:**
```
{
  chat_id : int
}
```

### Delete a Chat
**Route:** DELETE /chat/delete \
**In:**
```
{
  chat_id : int,
  token : token
}
```
**Out:** NONE

### Update a Chat's name
**Route:** PATCH /chat/update \
**In:**
```
{
  chat_id : int,
  chat_name : string,
  token : token
}
```
**Out:** NONE

### Get the chat's from a group
**Route:** POST /chat/chat_groups \
**In:**
```
{
  group_id : int,
  token : token
}
```
**Out:**
```
{
  chats : [
    ChatID : int,
    GroupID : int,
    ChatName : string
  ]
}
```
## Messages
### Testing Status: Pretty much done
### Send a Message
**Route:** POST/ message/send \
**In:**
```
{
  chat_id: int,
  content: string,
  token: token
}
```
**Out:**
```
{
  message_id : int
}
```
### Get all Messages in the chat
**Route:** POST/ message/messages \
**In:**
```
{
  chat_id: int,
  token: token
}
```
**Out:**
```
{
  messages: [
    MessageID: int,
    ChatId: int,
    MessageContent: string,
    TimeSent: Big int,
    ScreenName: string
   ]
}
```
### Get all recent Messages
**Route:** POST/ message/send \
**In:**
```
{
  chat_id: int,
  message_id: int,
  token: token
}
```
**Out:**
```
{
  messages: [
    MessageID: int,
    ChatId: int,
    MessageContent: string,
    TimeSent: Big int,
    ScreenName: string
   ]
}
```
    
    
