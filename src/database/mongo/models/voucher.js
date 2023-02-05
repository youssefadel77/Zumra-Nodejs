const mongoose = require('mongoose');
const { Schema } = mongoose;
const { voucherStatusEnum } = require('../../../constants/voucherStatus');
const { discountTypeEnum } = require('../../../constants/discountType');

const statusSchema = new Schema(
  {
    text: { type: String, enum: voucherStatusEnum, required: true }
  },
  {
    _id: false,
    timestamps: true
  }
);

const voucherSchema = new Schema({
  discountType: {
    type: String,
    trim: true,
    enum: discountTypeEnum
  },
  minCheckoutCost: {
    type: Number
  },
  maxDiscount: {
    type: Number
  },
  discountAmount: {
    type: Number
  },
  code: {
    type: String
  },
  expirationDate: {
    type: Date
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'USer'
  },
  status: [statusSchema]
});

voucherSchema.methods.getStatus = function () {
  return this.status[0].text;
};

module.exports = mongoose.model('Voucher', voucherSchema);
