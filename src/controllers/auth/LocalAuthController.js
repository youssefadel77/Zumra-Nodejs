const BaseController = require('../../core/baseController');
const { authSchema } = require('../../core/validation/schemas');
const { localAuthService } = require('../../services');


class LocalAuthController extends BaseController {
  constructor() {
    super({
      service: localAuthService,
      path: '/auth/local',
      routes: [
        {
          method: 'POST',
          path: '/login',
          handler: 'login'
        }
      ]
    });
  }



  async login(ctx) {
    ctx.validate(authSchema.login, ctx.request.body);
    ctx.body = await this.service.login(ctx.request.body);
  }
}

module.exports = LocalAuthController;
