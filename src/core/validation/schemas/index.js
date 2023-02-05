const idSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$'
    }
  },
  required: ['id'],
  additionalProperties: false
};

const voucherSchema = require('./voucher');
const authSchema = require('./auth');

module.exports = {
  idSchema,
  voucherSchema,
  authSchema
};
