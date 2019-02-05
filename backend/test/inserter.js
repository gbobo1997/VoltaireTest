const db = require('../API/db');

class Inserter{
    constructor(models, connection){
        this.models = models;
        this.connection = connection;
    }

    getModels()

    async executeInsert(){
        if (!this.validateModels()) return;

        const divided = this.divideModels();
        const ordered = this.getInsertOrder(divided);

        ordered.forEach(group => {
            await this.insertModelType(group.models, group.type);
        });
        console.log('insert Complete');
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
        divided = {};
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
        return [a].getInsertOrder() - [b].getInsertOrder();
    }

    async insertModelType(models, type){
        const query = this.getModelTypeQuery(models, type);

        const reuslt = await db.queryDb(this.connection, query);
        if (reuslt.isError()) throw new Error('error inserting models into db: '+reuslt.getError());
        else return;
    }

    getModelTypeQuery(models, type){
        if (models === null || models.length === 0) return;

        const db_name = [type].getDbName();
        const columns = [type].getInsertColumns();
        const values = getValueString(models);

        return `INSERT INTO ${db_name} ${columns} VALUES ${values}`;
    }
}

module.exports = Inserter;