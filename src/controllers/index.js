const BaseController = require('../core/baseController');

class Index extends BaseController {
  constructor() {
    super({
      path: '/',
      routes: [{ method: 'GET', path: '/', handler: 'main' }]
    });
  }

  async main(ctx) {
    ctx.body = { message: 'API the server running successfully !' };
  }
}

module.exports = Index;
