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

    getID(){
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

    static getValueString(models){
        return models.map(model => model.getValueString()).join();
    }
}

class UserModel extends DbModel{
    static insert_id = 0;

    constructor(name, screen_name, password){
        super(insert_id);
        insert_id++;

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
        const props = [this.name, this.screen_name, this.password];
        return DbModel.getValueString(props);
    }

    static async encryptPassword(password){
        return await bcrypt.hash(password, 10);
    }

    static getDbName(){
        return 'Users';
    }

    static getInsertColumns(){
        return '(UserName, ScreenName, Password)';
    }

    static getInsertOrder(){
        return 0;
    }
}


//this is a test model
class DocumentModel extends DbModel{
    static insert_id = 0;

    constructor(name, content){
        super(insert_id + 1);
        insert_id++;

        this.name = name;
        this.content = content;
        this.owner = [];
    }

    hasValidAttributes(){
        return (super.hasValidAttributes() && this.name != null && this.owner.length > 0);
    }

    hasValidRelationships(user_ids){
        this.owner.forEach(o => {
            if (!user_ids.includes(o)) return false;
        });
        return true;
    }

    addOwner(user){
        if (!(user instanceof UserModel)) throw new Error('document owner must be a user');
        this.owner.push(user.getID());
    }
}

module.exports = { TestModels, UserModel }