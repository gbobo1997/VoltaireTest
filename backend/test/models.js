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

    static getInsertOrder(){
        return 0;
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
        return [chat_props, member_props.join()];
    }

    static getDbName(){
        return ['ChatGroup', 'GroupMembers'];
    }

    static getInsertColumns(){
        return ['(GroupName)', '(GroupID, UserID)'];
    }

    static getInsertOrder(){
        return 1;
    }
}
GroupModel.insert_id = 1;

module.exports = { TestModels, UserModel, GroupModel }