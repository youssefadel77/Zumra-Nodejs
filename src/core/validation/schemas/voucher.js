const { discountTypeEnum } = require('../../../constants/discountType');
const { voucherStatusEnum } = require('../../../constants/voucherStatus');

module.exports = {
  create: {
    type: 'object',
    properties: {
      discountType: { type: 'string', enum: discountTypeEnum },
      minCheckoutCost: { type: 'number', minimum: 0 },
      maxDiscount: { type: 'number', minimum: 0 },
      discountAmount: { type: 'number', minimum: 0 },
      userId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
      expirationDate: { type: 'string' }
    },
    required: ['discountType', 'minCheckoutCost', 'maxDiscount', 'discountAmount', 'userId', 'expirationDate']
  },
  updateStatus: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: voucherStatusEnum }
    },
    required: ['status']
  },
  redeem: {
    type: 'object',
    properties: {
      totalCost: { type: 'number', minimum: 10 },
      userId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
      voucherId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
    },
    required: ['totalCost']
  }
};
