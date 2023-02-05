/* eslint-disable global-require */
const _ = require('lodash');
const BaseModel = require('./BaseModel');

class ModelsFactory {
    static getModel(name) {
        const model = require('mongoose').model(name);
        return new BaseModel(model, name);
    }

    static create(models) {
        let mModels = models;
        if (_.isString(models)) {
            mModels = this.getModel(models);
        } else if (_.isArray(models)) {
            mModels = {};
            for (let i = 0; i < models.length; i += 1) {
                mModels[models[i]] = this.getModel(models[i]);
            }
        }

        return mModels;
    }
}

module.exports = ModelsFactory;
