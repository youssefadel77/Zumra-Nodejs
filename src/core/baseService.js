const _ = require('lodash');
const errors = require('../common/errors.js');
const utils = require('../common/utils');
const crypto = require('../common/crypto');
const { ObjectId } = require('mongoose').Types;

class BaseService {
  constructor() {
    // Errors
    this.UnauthenticatedError = errors.UnauthenticatedError;
    this.UnauthorizedError = errors.UnauthorizedError;
    this.ValidationError = errors.ValidationError;
    this.NotFoundError = errors.NotFoundError;
    this.utils = utils;
    this.crypto = crypto;
    this.ObjectId = ObjectId;
  }

  _validateExistence(object, message) {
    if (!object) throw new this.NotFoundError(message);
  }
}

module.exports = BaseService;
