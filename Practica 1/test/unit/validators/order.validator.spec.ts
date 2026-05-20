import { OrderValidator } from '../../../src/application/validators/order.validator';
import { Package, DiscountType } from '../../../src/interfaces/order.interface';
import { RpcException } from '@nestjs/microservices';

describe('OrderValidator', () => {
  let validator: OrderValidator;

  beforeEach(() => {
    validator = new OrderValidator();
  });

  describe('validate packages', () => {
    it('should throw error when no packages provided', () => {
      const data = {
        packages: [],
        insuranceEnabled: false,
      };

      expect(() => validator.validate(data)).toThrow(RpcException);
    });

    it('should throw error when weight is 0', () => {
      const data = {
        packages: [
          {
            weightKg: 0,
            heightCm: 30,
            widthCm: 20,
            lengthCm: 10,
            fragile: false,
            declaredValueQCents: 0,
          },
        ],
        insuranceEnabled: false,
      };

      expect(() => validator.validate(data)).toThrow(RpcException);
    });

    it('should throw error when weight is negative', () => {
      const data = {
        packages: [
          {
            weightKg: -5,
            heightCm: 30,
            widthCm: 20,
            lengthCm: 10,
            fragile: false,
            declaredValueQCents: 0,
          },
        ],
        insuranceEnabled: false,
      };

      expect(() => validator.validate(data)).toThrow(RpcException);
    });

    it('should throw error when dimensions are 0 or negative', () => {
      const data = {
        packages: [
          {
            weightKg: 5,
            heightCm: 0,
            widthCm: 20,
            lengthCm: 10,
            fragile: false,
            declaredValueQCents: 0,
          },
        ],
        insuranceEnabled: false,
      };

      expect(() => validator.validate(data)).toThrow(RpcException);
    });

    it('should throw error when declared value is negative', () => {
      const data = {
        packages: [
          {
            weightKg: 5,
            heightCm: 30,
            widthCm: 20,
            lengthCm: 10,
            fragile: false,
            declaredValueQCents: -1000,
          },
        ],
        insuranceEnabled: false,
      };

      expect(() => validator.validate(data)).toThrow(RpcException);
    });
  });

  describe('validate insurance', () => {
    it('should throw error when insurance enabled but declared value is 0', () => {
      const data = {
        packages: [
          {
            weightKg: 5,
            heightCm: 30,
            widthCm: 20,
            lengthCm: 10,
            fragile: false,
            declaredValueQCents: 0,
          },
        ],
        insuranceEnabled: true,
      };

      expect(() => validator.validate(data)).toThrow(RpcException);
      expect(() => validator.validate(data)).toThrow(/Insurance enabled but total declared value is 0/);
    });

    it('should pass when insurance enabled and declared value > 0', () => {
      const data = {
        packages: [
          {
            weightKg: 5,
            heightCm: 30,
            widthCm: 20,
            lengthCm: 10,
            fragile: false,
            declaredValueQCents: 10000,
          },
        ],
        insuranceEnabled: true,
      };

      expect(() => validator.validate(data)).not.toThrow();
    });
  });

  describe('validate discount', () => {
    it('should throw error when PERCENT discount > 35', () => {
      const data = {
        packages: [
          {
            weightKg: 5,
            heightCm: 30,
            widthCm: 20,
            lengthCm: 10,
            fragile: false,
            declaredValueQCents: 0,
          },
        ],
        insuranceEnabled: false,
        discount: {
          type: DiscountType.PERCENT,
          value: 40,
        },
      };

      expect(() => validator.validate(data)).toThrow(RpcException);
      expect(() => validator.validate(data)).toThrow(/cannot exceed 35%/);
    });

    it('should pass when PERCENT discount <= 35', () => {
      const data = {
        packages: [
          {
            weightKg: 5,
            heightCm: 30,
            widthCm: 20,
            lengthCm: 10,
            fragile: false,
            declaredValueQCents: 0,
          },
        ],
        insuranceEnabled: false,
        discount: {
          type: DiscountType.PERCENT,
          value: 35,
        },
      };

      expect(() => validator.validate(data)).not.toThrow();
    });
  });
});
