db.auth('admin', 'admin-password');

db = db.getSiblingDB('voucherDB');

db.createUser({
  user: 'voucher-user',
  pwd: 'voucher-password',
  roles: [{ role: 'readWrite', db: 'voucherDB' }],
  passwordDigestor: 'server'
});
