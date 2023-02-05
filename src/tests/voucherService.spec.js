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

const mockModels = {
  User: {
    getById: MockUserGetById
  },
  Voucher: {
    getById: MockVoucherGetById,
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
        console.log(error);
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
});
