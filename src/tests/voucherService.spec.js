jest.mock('../database/mongo/ModelsFactory');

const MockUserGetById = jest.fn(function (id) {
  return {
    _id: id,
    name: 'Youssef Adel',
    email: 'youssef@zumra.com',
    phone: '+201147726477'
  };
});

const MockVoucherGetById = jest.fn(function (id) {
  return {
    _id: id,
    discountType: 'percentage',
    minCheckoutCost: 150,
    maxDiscount: 50,
    expirationDate: '2023-02-05T20:52:00.000Z',
    userId: '63de1cabcce3c4a5a4a281d5',
    code: '4A9B63',
    status: [
      {
        text: 'active',
        createdAt: '2023-02-04T14:01:47.407Z',
        updatedAt: '2023-02-04T14:01:47.407Z'
      }
    ],
    created_at: '2023-02-04T11:08:47.735Z',
    updated_at: '2023-02-04T11:08:47.735Z'
  };
});

const MockVoucherGetOne = jest.fn(function (id) {
  return {
    _id: id,
    discountType: 'percentage',
    minCheckoutCost: 150,
    maxDiscount: 50,
    discountAmount: 10,
    expirationDate: '2023-02-05T20:52:00.000Z',
    userId: '63de1cabcce3c4a5a4a281d5',
    code: '4A9B63',
    status: [
      {
        text: 'active',
        createdAt: '2023-02-04T14:01:47.407Z',
        updatedAt: '2023-02-04T14:01:47.407Z'
      }
    ],
    created_at: '2023-02-04T11:08:47.735Z',
    updated_at: '2023-02-04T11:08:47.735Z',
    save: jest.fn()
  };
});

const MockVoucherSave = jest.fn();

const mockModels = {
  User: {
    getById: MockUserGetById
  },
  Voucher: {
    getById: MockVoucherGetById,
    getOne: MockVoucherGetOne,
    save: jest.fn(),
    create: function (data) {
      return { ...data, _id: '63dfb69cda30ed09cd8b7081' };
    },
    getAll: function (query) {
      return [
        {
          _id: '63de3cbfc46299108919caca',
          discountType: 'percentage',
          minCheckoutCost: 150,
          maxDiscount: 50,
          expirationDate: '2023-02-05T20:52:00.000Z',
          userId: '63de1cabcce3c4a5a4a281d5',
          code: '4A9B63',
          status: [
            {
              text: 'redeemed',
              createdAt: '2023-02-04T14:01:47.407Z',
              updatedAt: '2023-02-04T14:01:47.407Z'
            }
          ],
          created_at: '2023-02-04T11:08:47.735Z',
          updated_at: '2023-02-04T11:08:47.735Z',
          __v: 5
        }
      ];
    }
  }
};
jest.mock('../database/mongo/models', function () {
  return mockModels;
});

const voucherService = require('../services/voucherService');

describe('VoucherService', () => {
  beforeEach(() => {});
  describe('createVoucher', () => {
    it('should throw exception because userId not exists ', async function () {
      MockUserGetById.mockImplementationOnce(function () {
        return undefined;
      });
      const data = {
        discountType: 'percentage',
        minCheckoutCost: 150,
        maxDiscount: 10,
        discountAmount: 50,
        expirationDate: '2023-2-5 22:52:00.000',
        userId: '63de1cabcce3c4a5a4a281d5'
      };
      try {
        await voucherService.create(data);
        throw new Error('Test not passed');
      } catch (error) {
        expect(error.message).toBe('There is no user with that ID');
        expect(error.status).toBe(404);
      }
    });
    it('should throw exception because percentage discount amount more than 100', async function () {
      const data = {
        discountType: 'percentage',
        minCheckoutCost: 150,
        maxDiscount: 10,
        discountAmount: 120,
        expirationDate: '2023-2-5 22:52:00.000',
        userId: '63de1cabcce3c4a5a4a281d5'
      };
      try {
        await voucherService.create(data);
      } catch (error) {
        expect(error.message).toBe('Discount amount must be less than 100');
        expect(error.status).toBe(400);
      }
    });
    it('should create voucher successfully', async function () {
      const data = {
        discountType: 'percentage',
        minCheckoutCost: 150,
        maxDiscount: 10,
        discountAmount: 50,
        expirationDate: '2023-2-5 22:52:00.000',
        userId: '63de1cabcce3c4a5a4a281d5'
      };
      const voucher = await voucherService.create(data);
      expect(voucher._id).toBe('63dfb69cda30ed09cd8b7081');
    });
  });
  describe('findOne', () => {
    it('should throw exception because voucher not exists ', async function () {
      MockVoucherGetById.mockImplementationOnce(function () {
        return undefined;
      });
      const data = '63dfb69cda30ed09cd8b7088';
      try {
        await voucherService.findById(data);
        throw new Error('Test not passed');
      } catch (error) {
        expect(error.message).toBe('There is no voucher with that ID');
        expect(error.status).toBe(404);
      }
    });
    it('should return a voucher ', async function () {
      const data = '63dfb69cda30ed09cd8b7081';
      const voucher = await voucherService.findById(data);
      expect(voucher._id).toBe('63dfb69cda30ed09cd8b7081');
    });
  });
  describe('redeem', () => {
    it('should throw exception because user not found', async function () {
      MockUserGetById.mockImplementationOnce(function () {
        return undefined;
      });
      const data = {
        totalCost: 1500,
        voucherId: '63dfb69cda30ed09cd8b7081',
        userId: '63ce1cabcce3c4a5a4a981d9'
      };
      try {
        await voucherService.redeem(data);
        throw new Error('Test not passed');
      } catch (error) {
        expect(error.message).toBe('There is no user with that ID');
        expect(error.status).toBe(404);
      }
    });
    it('should throw exception because voucher not exists or user not allowed', async function () {
      MockVoucherGetOne.mockImplementationOnce(function () {
        return undefined;
      });
      const data = {
        totalCost: 1500,
        voucherId: '63e03b27d071340dc8eac1fa',
        userId: '63de1cabcce3c4a5a4a281d5'
      };
      try {
        await voucherService.redeem(data);
        throw new Error('Tests not passed');
      } catch (error) {
        expect(error.message).toBe('There is no voucher with that ID or You are not allowed to redeem this voucher');
        expect(error.status).toBe(404);
      }
    });
    it('should throw exception because total cost less than minimum checkout ', async function () {
      const data = {
        totalCost: 100,
        voucherId: '63e03b27d071340dc8eac1fa',
        userId: '63de1cabcce3c4a5a4a281y8'
      };
      try {
        await voucherService.redeem(data);
        throw new Error('Tests not passed');
      } catch (error) {
        expect(error.message).toBe('Yor total const not reached to the minimum checkout cost');
        expect(error.status).toBe(400);
      }
    });
    it('should throw exception because voucher already redeemed', async function () {
      MockVoucherGetOne.mockImplementationOnce(function () {
        return {
          _id: '63e03b27d071340dc8eac1fa',
          discountType: 'percentage',
          minCheckoutCost: 150,
          maxDiscount: 50,
          expirationDate: '2023-02-05T20:52:00.000Z',
          userId: '63de1cabcce3c4a5a4a281d5',
          code: '4A9B63',
          status: [
            {
              text: 'redeemed',
              createdAt: '2023-02-04T14:01:47.407Z',
              updatedAt: '2023-02-04T14:01:47.407Z'
            },
            {
              text: 'active',
              createdAt: '2023-02-04T14:01:47.407Z',
              updatedAt: '2023-02-04T14:01:47.407Z'
            }
          ],
          created_at: '2023-02-04T11:08:47.735Z',
          updated_at: '2023-02-04T11:08:47.735Z',
          save: jest.fn()
        };
      });
      const data = {
        totalCost: 1500,
        voucherId: '63e03b27d071340dc8eac1fa',
        userId: '63de1cabcce3c4a5a4a281y8'
      };

      try {
        await voucherService.redeem(data);
        throw new Error('Tests not passed');
      } catch (error) {
        expect(error.message).toBe('order status is redeemed and can only change to ');
        expect(error.status).toBe(400);
      }
    });
    it('should redeem a  voucher and return new total cost percentage',async function () {
      const data = {
        totalCost: 1500,
        voucherId: '63e0d58e8fb6d8077c08fa0d',
        userId: '63de1cabcce3c4a5a4a281d5'
      };
      const result = await voucherService.redeem(data);
      expect(result.totalCostAfterDiscount).toBe(1450);
    });
    it('should redeem a  voucher and return new total cost fixed', async function () {
      MockVoucherGetOne.mockImplementationOnce(function () {
        return {
          _id: '63e03b27d071340dc8eac1fa',
          discountType: 'fixed',
          minCheckoutCost: 150,
          maxDiscount: 50,
          discountAmount: 10,
          expirationDate: '2023-02-05T20:52:00.000Z',
          userId: '63de1cabcce3c4a5a4a281d5',
          code: '4A9B63',
          status: [
            {
              text: 'active',
              createdAt: '2023-02-04T14:01:47.407Z',
              updatedAt: '2023-02-04T14:01:47.407Z'
            }
          ],
          created_at: '2023-02-04T11:08:47.735Z',
          updated_at: '2023-02-04T11:08:47.735Z',
          save: jest.fn()
        };
      });
      const data = {
        totalCost: 1500,
        voucherId: '63e0d58e8fb6d8077c08fa0d',
        userId: '63de1cabcce3c4a5a4a281d5'
      };
      const result = await voucherService.redeem(data);
      expect(result.totalCostAfterDiscount).toBe(1490);
    });
  });
});
