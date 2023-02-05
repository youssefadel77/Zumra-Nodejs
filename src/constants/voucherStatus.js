const active = 'active';
const inActive = 'inActive';
const redeemed = 'redeemed';

const voucherStatus = {
  active,
  inActive,
  redeemed
};

const voucherStatusEnum = ['active', 'inActive', 'redeemed'];

const VOUCHER_STATUS_TRANSITION = {
  [active]: [inActive, redeemed],
  [inActive]: [active],
  [redeemed]: []
};

module.exports = {
  voucherStatus,
  voucherStatusEnum,
  VOUCHER_STATUS_TRANSITION
};
