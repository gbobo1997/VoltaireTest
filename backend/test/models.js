const bcrypt = require('bcrypt');

class TestModels{
    constructor(models, token_model=null){
        this.models = models;
        this.token_model = token_model;
    }
}

class DbModel{
    constructor(id){
        this.id = id;
    }

    getId(){
        return this.id;
    }

    hasValidAttributes(){
        return (Number.isInteger(this.id));
    }

    hasValidRelationships(){
        return true;
    }

    getOptionalQuery(){
        return null;
    }

    static getValueString(props){
        return '('+props.join()+')';
    }
}

class UserModel extends DbModel{
    constructor(name, screen_name, password){
        super(UserModel.insert_id);
        UserModel.insert_id++;

        this.name = name;
        this.screen_name = screen_name;
        this.password = password;
    }

    hasValidAttributes(){
        return (super.hasValidAttributes() && this.name != null && this.screen_name != null && this.password != null);
    }

    hasValidRelationships(){
        return true;
    }

    getValueString(){
        const props = ["'"+this.name+"'", "'"+this.screen_name+"'", "'"+this.password+"'"];
        return [DbModel.getValueString(props)];
    }

    async encryptPassword(){
        this.password = await bcrypt.hash(this.password, 10);
    }

    static getDbName(){
        return ['Users'];
    }

    static getInsertColumns(){
        return ['(UserName, ScreenName, Password)'];
    }
}
UserModel.insert_id = 1;

class GroupModel extends DbModel{
    constructor(name){
        super(GroupModel.insert_id);
        GroupModel.insert_id++;

        this.name = name;
        this.members = [];
    }

    hasValidAttributes(){
        return (super.hasValidAttributes() && this.name != null);
    }

    hasValidRelationships(){
        return this.members.length > 0;
    }

    addMember(user){
        if (!(user instanceof UserModel)) throw new Error('group member must be a user');
        this.members.push(user.getId());
    }

    getValueString(){
        const chat_props = ["'"+this.name+"'"];
        const member_props = [];

        this.members.map(id =>{
            const props = [this.id, id];
            member_props.push(DbModel.getValueString(props));
        });
        return [DbModel.getValueString(chat_props), member_props.join()];
    }

    static getDbName(){
        return ['ChatGroup', 'GroupMembers'];
    }

    static getInsertColumns(){
        return ['(GroupName)', '(GroupID, UserID)'];
    }
}
GroupModel.insert_id = 1;

class ChatModel extends DbModel{
    constructor(name){
        super(ChatModel.insert_id);
        ChatModel.insert_id++;

        this.name = name;
        this.group_id = null;
    }

    hasValidAttributes(){
        return (super.hasValidAttributes() && this.group_id != null && this.name != null )
    }

    hasValidRelationships(){
        return this.group_id != null;
    }

    addToGroup(group){
        this.group_id = group.id;
    }

    getValueString(){
        const chat_props = ["'"+this.group_id+"'","'"+this.name+"'"];
        return [DbModel.getValueString(chat_props)];
    }

    static getDbName(){
        return ['Chat'];
    }

    static getInsertColumns(){
        return ['(GroupID, ChatName)'];
    }
}
ChatModel.insert_id = 1;

class FileModel extends DbModel{
    constructor(name, content){
        super(FileModel.insert_id);
        FileModel.insert_id++;
        this.name = name;
        this.content = content;
        this.group_id = null;

        this.lock_id = null;
        this.lock_time = null;
    }

    hasValidAttributes(){
        return (super.hasValidAttributes() && this.name != null && this.content != null);
    }

    hasValidRelationships(){
        return this.group_id != null;
    }

    addToGroup(group){
        this.group_id = group.id;
    }

    addLock(user, time){
        this.lock_id = user.id;
        this.lock_time = time;
    }

    getOptionalQuery(){
        if (this.lock_id !== null && this.lock_time !== null){
            return `INSERT INTO FileLocks (FileID, UserID, Expires) VALUES (${this.id}, ${this.lock_id}, '${this.lock_time}')`;
        }
        else return null;
    }

    getValueString(){
        const props = ["'"+this.group_id+"'", "'"+this.name+"'", "'"+this.content+"'"];
        return [DbModel.getValueString(props)];
    }

    static getDbName(){
        return ['File'];
    }

    static getInsertColumns(){
        return ['(GroupID, FileName, FileContent)'];
    }
}
FileModel.insert_id = 1;

class MessageModel extends DbModel{
    constructor(content, time){
    super(MessageModel.insert_id);
        MessageModel.insert_id++;;
        this.content = content;
        this.time_sent = time;

        this.chat_id = null;
        this.user_id = null;
    }

    hasValidAttributes(){
        return super.hasValidAttributes();
    }

    hasValidRelationships(){
        return (this.chat_id != null && this.user_id != null);
    }

    addAuthor(user){
        this.user_id = user.id;
    }

    addToChat(chat){
        this.chat_id = chat.id;
    }

    getValueString(){
        const props = ["'"+this.user_id+"'", "'"+this.chat_id+"'", "'"+this.content+"'", "'"+this.time_sent+"'"];
        return [DbModel.getValueString(props)];
    }

    static getDbName(){
        return ['Message'];
    }

    static getInsertColumns(){
        return ['(UserID, ChatID, MessageContent, TimeSent)'];
    }
}
MessageModel.insert_id = 1;

function resetInsertIds(){
    UserModel.insert_id = 1;
    GroupModel.insert_id = 1;
    FileModel.insert_id = 1;
    ChatModel.insert_id = 1;
    MessageModel.inser_id = 1;
}

module.exports = { TestModels, UserModel, GroupModel, ChatModel, FileModel, MessageModel, resetInsertIds }