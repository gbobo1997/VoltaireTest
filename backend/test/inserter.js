const db = require('../API/db');
const { UserModel } = require('./models');

class Inserter{
    constructor(models, connection){
        this.models = models;
        this.connection = connection;
        this.classes = { UserModel }
    }

    async executeInsert(){
        if (!this.validateModels()) return;

        const divided = this.divideModels();
        const ordered = this.getInsertOrder(divided);

        ordered.forEach(async group => {
            await this.insertModelType(group.models, group.type);
        });
    }

    validateModels(){
        this.models.forEach(model =>{
            if (!model.hasValidAttributes() || !model.hasValidRelationships()){
                return false;
            }
        });
        return true;
    }

    divideModels(){
        const divided = {};
        this.models.forEach(model =>{
            const type = model.constructor.name;
            if (divided[type] === undefined) divided[type] = [];
            divided[type].push(model);
        });
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
        return a.constructor.getInsertOrder() - b.constructor.getInsertOrder();
    }

    async insertModelType(models, type){
        const query = this.getModelTypeQuery(models, type);

        const result = await db.queryDb(this.connection, query);
        if (result.isError()) throw new Error('error inserting models into db: '+result.getParams().error);
        else return;
    }

    getModelTypeQuery(models, type){
        if (models === null || models.length === 0) return;

        const db_name = this.getDbName(type);
        const columns = this.getInsertColumns(type);
        const values = this.getValueString(models);

        return `INSERT INTO ${db_name} ${columns} VALUES ${values}`;
    }

    getDbName(type){
        return this.classes[type].getDbName();
    }

    getInsertColumns(type){
        return this.classes[type].getInsertColumns();
    }

    getValueString(models){
        return models.map(model => model.getValueString()).join();
    }
}

module.exports = Inserter;