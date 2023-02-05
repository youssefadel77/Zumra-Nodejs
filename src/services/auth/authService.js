const BaseService = require('../../core/baseService');

class AuthService extends BaseService {
  async login() {
    throw new this.ValidationError('this function needs to be implemented');
  }
}

module.exports = AuthService;
