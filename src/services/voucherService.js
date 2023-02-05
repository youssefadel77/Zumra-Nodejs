const _ = require('lodash');
const BaseService = require('../core/baseService.js');
const { Voucher, User } = require('../database/mongo/models');
const StringGenerators = require('../common/stringGenerators');
const { voucherStatus, VOUCHER_STATUS_TRANSITION } = require('../constants/voucherStatus');
const { discountType } = require('../constants/discountType');

class VoucherService extends BaseService {
  async create(data) {
    const user = await User.getById(data.userId);
    this._validateExistence(user, 'There is no user with that ID');
    if (data.discountType === discountType.percentage && data.discountAmount > 100) throw new this.ValidationError('Discount amount must be less than 100');
    data.code = await this._generateVoucherCode();
    data.status = [{ text: voucherStatus.active }];
    return Voucher.create(data);
  }

  async _generateVoucherCode() {
    const number = `${Math.floor(Math.random() * 9000) + 1000}${StringGenerators.generateRandomString(2)}`;
    const code = number
      .split('')
      .sort(function () {
        return 0.5 - Math.random();
      })
      .join('');
    return code;
  }

  async find(params) {
    let paginate = true;
    const query = {};
    if (params.status) {
      query['status.0.text'] = { $in: params.status.split(',') };
    }
    if (params.discountType) {
      query.discountType = { $in: params.discountType.split(',') };
    }
    if (params.userId) {
      query.userId = { $in: params.userId.split(',') };
    }
    if (params.paginate) {
      paginate = this.utils.parseBoolean(params.paginate);
    }
    return Voucher.getAll(query, params, paginate);
  }

  async findById(id, params) {
    const voucher = await Voucher.getById(id, params);
    this._validateExistence(voucher, 'There is no voucher with that ID');
    return voucher;
  }

  async update(id, data) {
    const voucher = await Voucher.getById(id);
    this._validateExistence(voucher, 'There is no voucher with that ID');
    return Voucher.updateById(id, data, { new: true });
  }

  async updateVoucherStatus(id, { status }) {
    const voucher = await Voucher.getById(id);
    this._validateExistence(voucher, 'There is no voucher with that ID');
    this._validateVoucherStatus(voucher.getStatus(), status);
    voucher.status.unshift({
      text: status
    });
    await voucher.save();
    return voucher;
  }

  _validateVoucherStatus(voucherStatus, status) {
    if (!VOUCHER_STATUS_TRANSITION[voucherStatus].includes(status)) {
      throw new this.ValidationError(`order status is ${voucherStatus} and can only change to ${VOUCHER_STATUS_TRANSITION[voucherStatus].join(',')}`);
    }
  }

  async redeem(data) {
    const voucher = await this._validateUserVoucherExistence(data);
    this._validateVoucherStatus(voucher.getStatus(), voucherStatus.redeemed);
    let discountAmount = await this._getDiscountAmount(voucher, data);
    if (data.totalCost < voucher.minCheckoutCost) throw new this.NotFoundError('Yor total const not reached to the minimum checkout cost');
    if (discountAmount > voucher.maxDiscount) discountAmount = voucher.maxDiscount;
    voucher.status.unshift({
      text: voucherStatus.redeemed
    });
    await voucher.save();
    const totalCostAfterDiscount = data.totalCost - discountAmount;
    return { totalCostAfterDiscount };
  }

  async _validateUserVoucherExistence(data) {
    const user = await User.getById(data.userId);
    this._validateExistence(user, 'There is no user with that ID');
    const voucher = await Voucher.getOne({ _id: data.voucherId, userId: data.userId });
    this._validateExistence(voucher, 'There is no voucher with that ID or You are not allowed to redeem this voucher');
    return voucher;
  }

  async _getDiscountAmount(voucher, data) {
    return voucher.discountType === discountType.fixed
      ? voucher.discountAmount
      : voucher.discountType === discountType.percentage
      ? (data.totalCost * voucher.discountAmount) / 100
      : 0;
  }
}

module.exports = new VoucherService();
