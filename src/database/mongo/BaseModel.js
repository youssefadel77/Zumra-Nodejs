/* eslint-disable max-len */

const _ = require('lodash');

/**
 * params:
 * page: number
 * limit: number
 * fields: comma separated values for data you want to be returned
 * lean: [false] boolean to indicate that you need only data or full mongoose object
 * sort: comma separated values, with/without minus operator Ex. sort=-table,followers
 * populate: array of arrays, which contains populate field and selection Ex. [['employees', '_id name'], ['address']]
 *           or array of mongoose populate objects objects
 *           {
 *               path: 'fans',
 *               match: { age: { $gte: 21 }},
 *               // Explicitly exclude `_id`, see http://bit.ly/2aEfTdB
 *               select: 'name -_id',
 *               options: { limit: 5 }
 *           }
 *  Note:
 *  We can send additional params from controller to service under fields _options
 *  for security this will be removed from query mutation so its only send internally by devs
 */
class BaseModel {
    constructor(model, name) {
        this.model = model;
        this.name = name;
    }

    _buildQuery(func, params) {
        if (_.isNil(params)) {
            return func;
        }

        const {fields, populate, lean} = params;

        if (!_.isNil(fields)) func.select(fields);
        if (!_.isNil(lean)) func.lean();

        // Add populate
        if (populate) {
            for (let i = 0; i < populate.length; i += 1) {
                if (_.isArray(populate[i])) {
                    func.populate(...populate[i]);
                } else {
                    func.populate(populate[i]);
                }
            }
        }

        return func;
    }

    async getDocumentsCount(query) {
        return this.model.countDocuments(query);
    }

    async getCount(query, options) {
        return this.model.countDocuments(query, options).exec();
    }

    async exists(query) {
        const exists = await this.model.findOne(query).lean().exec();
        return !_.isNil(exists);
    }

    async create(data) {
        const document = new this.model.prototype.constructor(data);
        return document.save();
    }

    async createMany(data) {
        return this.model.insertMany(data);
    }

    async update(query, data, options, params) {
        const q = this._buildQuery(this.model.update(query, data, options), params);
        return q.exec();
    }

    async updateOne(query, data, options, params) {
        const q = this._buildQuery(this.model.findOneAndUpdate(query, data, options), params);
        return q.exec();
    }

    async updateById(id, data, options, params) {
        const q = this._buildQuery(this.model.findByIdAndUpdate(id, data, options), params);
        return q.exec();
    }

    async updateMany(query, data, options, params) {
        const q = this._buildQuery(this.model.updateMany(query, data, options), params);
        return q.exec();
    }

    async getAll(query, params = {}, paginate = true) {
        const {page = 0, limit = 10, sort} = params;

        const q = this._buildQuery(this.model.find(query || {}), params);
        if (paginate) {
            q.skip(parseInt(limit) * parseInt(page));
            q.limit(parseInt(limit));
        }

        if (sort) {
            q.sort(sort);
        }
        let result = await q.exec();

        if (paginate) {
            let count;
            if (_.isEmpty(query)) {
                count = await this.getDocumentsCount();
            } else {
                count = await this.getCount(query || {});
            }
            const pagesCount = Math.ceil(count / limit) || 1;
            result = {
                [this.model.collection.name]: result,
                page: parseInt(page),
                pages: pagesCount,
                length: count
            };
        }

        return result;
    }

    async aggregate(query, params = {}, paginate = true) {
        let {page, limit = 10} = params;
        let pagesCount, count;
        if (paginate) {
            query.push({$count: 'length'});
            count = await this.model.aggregate(query);
            if (count.length > 0) {
                count = count[0].length;
            }
            query.pop();
            if (!limit) limit = count;
            pagesCount = Math.ceil(count / limit) || 1;

            query.push({
                $facet: {
                    [this.model.collection.name]: [{$skip: parseInt(limit || 0) * parseInt(page || 0)}, {$limit: parseInt(limit || 0)}]
                }
            });
        }
        const q = this.model.aggregate(query);
        let result = await q.exec();
        if (paginate) {
            result = {
                [this.model.collection.name]: result[0][this.model.collection.name],
                page: parseInt(page || 0),
                pages: pagesCount,
                length: count
            };
        }
        return result;
    }

    async getOne(query, params) {
        const q = this._buildQuery(this.model.findOne(query || {}), params);
        return q.exec();
    }

    async getById(id, params) {
        const q = this._buildQuery(this.model.findById(id), params);
        return q.exec();
    }

    async deleteOne(query) {
        const q = this.model.findOneAndRemove(query);
        return q.exec();
    }

    async delete(query) {
        const q = this.model.deleteMany(query);
        return q.exec();
    }

    async deleteById(id) {
        const q = this.model.findByIdAndDelete(id);
        return q.exec();
    }
}

module.exports = BaseModel;
