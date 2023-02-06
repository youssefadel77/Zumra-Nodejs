const BaseController = require('../core/baseController');
const { idSchema, voucherSchema } = require('../core/validation/schemas');
const { voucherService } = require('../services');

class VoucherController extends BaseController {
  constructor() {
    super({
      service: voucherService,
      path: '/vouchers',
      routes: [
        {
          method: 'POST',
          path: '/',
          handler: 'create'
        },
        {
          method: 'GET',
          path: '/',
          handler: 'find'
        },
        {
          method: 'GET',
          path: '/:id',
          handler: 'findById'
        },
        {
          method: 'PUT',
          path: '/:id',
          handler: 'update'
        },
        {
          method: 'PATCH',
          path: '/status/:id',
          handler: 'updateVoucherStatus'
        },
        {
          method: 'PATCH',
          path: '/redeem/:id',
          handler: 'redeem'
        }
      ]
    });
  }

  async create(ctx) {
    ctx.validate(voucherSchema.create, ctx.request.body);
    ctx.body = await this.service.create(ctx.request.body);
  }

  async find(ctx) {
    ctx.body = await this.service.find(ctx.request.query);
  }

  async findById(ctx) {
    ctx.validate(idSchema, { id: ctx.params.id });
    ctx.body = await this.service.findById(ctx.params.id, ctx.request.query);
  }

  async update(ctx) {
    ctx.validate(idSchema, { id: ctx.params.id });
    ctx.validate(voucherSchema.create, ctx.request.body, false);
    ctx.body = await this.service.update(ctx.params.id, ctx.request.body);
  }

  async updateVoucherStatus(ctx) {
    ctx.validate(idSchema, { id: ctx.params.id });
    ctx.validate(voucherSchema.updateStatus, ctx.request.body);
    ctx.body = await this.service.updateVoucherStatus(ctx.params.id, ctx.request.body);
  }

  async redeem(ctx) {
    ctx.request.body.userId = ctx._locals.user._id;
    ctx.request.body.voucherId = ctx.params.id;
    ctx.validate(voucherSchema.redeem, ctx.request.body);
    ctx.body = await this.service.redeem(ctx.request.body);
  }
}

module.exports = VoucherController;
