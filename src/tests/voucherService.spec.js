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

const mockModels = {
  User: {
    getById: MockUserGetById
  },
  Voucher: {
    getById: MockVoucherGetById,
    getOne: MockVoucherGetOne,
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
    // it('should make the discount and return the new cost of the order', async function () {
    //   const data = {
    //     totalCost: 1500,
    //     voucherId: '63e03b27d071340dc8eac1fa',
    //     userId: '63de1cabcce3c4a5a4a281y8'
    //   };
    //   const voucher = await voucherService.redeem(data);
    //   expect(voucher.totalCostAfterDiscount).toBe(1490);
    // });
    // it('should throw exception because voucher already redeemed', async function () {
    //
    //   const data = {
    //     totalCost: 1500,
    //     voucherId: '63e03b27d071340dc8eac1fa',
    //     userId: '63de1cabcce3c4a5a4a281y8'
    //   };
    //
    //   try {
    //     await voucherService.redeem(data);
    //     throw new Error('Tests not passed');
    //   } catch (error) {
    //     expect(error.message).toBe('order status is redeemed and can only change to ');
    //     expect(error.status).toBe(400);
    //   }
    // });
  });
});
