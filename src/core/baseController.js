const _ = require('lodash');

const validation = require('./validation');

class BaseController {
  constructor(config) {
    const { path, service, routes } = config;

    this.path = path;
    this.service = service;
    this.routes = routes || [];
  }

  async beforeAction(ctx, next) {
    // Apply hooks to context
    _.set(ctx, 'validate', this.validate);
    return next();
  }

  async afterAction(ctx, next) {
    await next();
    this.leanObject(ctx);
  }

  leanObject(ctx) {
    ctx.response.body = JSON.parse(JSON.stringify(_.get(ctx, 'response.body', {})));
  }

  // Context Hooks ////

  validate(schema, data, strict = true) {
    validation.validate(schema, data, strict);
  }
}

module.exports = BaseController;
