const db = require('../API/db');
const { UserModel, GroupModel } = require('./models');

class Inserter{
    constructor(models, connection){
        this.models = models;
        this.connection = connection;
        this.classes = { UserModel, GroupModel }
    }

    async executeInsert(){
        if (!this.validateModels()) return;

        const divided = this.divideModels();
        const ordered = this.getInsertOrder(divided);

        for (var group of ordered){
            await this.insertModelType(group.models, group.type);
        }
    }

    validateModels(){
        for (var model of this.models){
            if (!model.hasValidAttributes() || !model.hasValidRelationships()){
                return false;
            }
        }
        return true;
    }

    divideModels(){
        const divided = {};
        for (var model of this.models){
            const type = model.constructor.name;
            if (divided[type] === undefined) divided[type] = [];
            divided[type].push(model);
        }
        return divided;
    }

    getInsertOrder(divided){
        const types = Object.keys(divided);
        const ordered = types.sort(this.compareTypes);
        return ordered.map(o =>{
            return {type: o, models: divided[o]};
        });
    }

    compareTypes(a, b){
        return Inserter.getClassOrder(a) - Inserter.getClassOrder(b);
    }

    static getClassOrder(name){
        switch(name){
            case 'UserModel':
                return 1;
            case 'GroupModel':
                return 2;
            default:
                return 0;
        }
    }

    async insertModelType(models, type){
        if (type === 'UserModel'){
            for (var model of models){
                await model.encryptPassword();
            }
        }
        const queries = this.getModelTypeQuery(models, type);

        for (var query of queries){
            const result = await db.queryDb(this.connection, query);
            if (result.isError()) throw new Error('error inserting models into db: '+result.getParams().error);
        }
    }

    getModelTypeQuery(models, type){
        if (models === null || models.length === 0) return;

        const db_names = this.getDbName(type);
        const columns = this.getInsertColumns(type);
        const values = this.getValueString(models);

        const queries = db_names.map((db_name, index) =>{
            return `INSERT INTO ${db_name} ${columns[index]} VALUES ${values[index]}`;
        })

        return queries;
    }

    getDbName(type){
        return this.classes[type].getDbName();
    }

    getInsertColumns(type){
        return this.classes[type].getInsertColumns();
    }

    getValueString(models){
        const values = [];
        const all_values = models.map(model => model.getValueString());
        for (let index = 0; index < all_values[0].length; index++){
            const query_values = all_values.map(value => value[index]).join();
            values.push(query_values);
        }
        return values;
    }
}

module.exports = Inserter;