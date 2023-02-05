const _ = require('lodash');
const AuthService = require('./authService');
const { User } = require('../../database/mongo/models');

class LocalAuthService extends AuthService {
  async login(data) {
    const user = await User.getOne({ $or: [{ email: data.username }, { phone: data.username }] });
    if (!user || !this.crypto.compareHash(data.password, user.password)) {
      throw new this.ValidationError('Wrong username or password');
    }
    return this._getUserResponse(user.toObject());
  }

  async _getUserResponse(user) {
    return this.crypto
      .createJwtToken({
        sub: user._id.toString(),
      })
      .then((token) => {
        return {
          token,
          user: _.omit(user, ['password', '__v', 'updated_at', 'created_at'])
        };
      });
  }
}

module.exports = new LocalAuthService();
