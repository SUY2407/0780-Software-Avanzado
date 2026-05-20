import { DiscountCalculator } from '../../../src/application/calculators/discount.calculator';
import { Discount, DiscountType } from '../../../src/interfaces/order.interface';

describe('DiscountCalculator', () => {
  let calculator: DiscountCalculator;

  beforeEach(() => {
    calculator = new DiscountCalculator();
  });

  describe('calculateDiscount', () => {
    it('should return 0 for NONE discount type', () => {
      const discount: Discount = {
        type: DiscountType.NONE,
        value: 0,
      };

      const result = calculator.calculateDiscount(16036, discount);
      expect(result).toBe(0);
    });

    it('should calculate PERCENT discount correctly', () => {
      const discount: Discount = {
        type: DiscountType.PERCENT,
        value: 10,
      };

      const result = calculator.calculateDiscount(16036, discount);
      
      // 16036 * 0.10 = 1603.6, rounded = 1604
      expect(result).toBe(1604);
    });

    it('should calculate PERCENT discount with 35% limit', () => {
      const discount: Discount = {
        type: DiscountType.PERCENT,
        value: 35,
      };

      const result = calculator.calculateDiscount(10000, discount);
      
      // 10000 * 0.35 = 3500
      expect(result).toBe(3500);
    });

    it('should calculate FIXED discount correctly', () => {
      const discount: Discount = {
        type: DiscountType.FIXED,
        value: 50,
      };

      const result = calculator.calculateDiscount(67000, discount);
      
      // 50 Q * 100 = 5000 cents
      expect(result).toBe(5000);
    });

    it('should handle FIXED discount that exceeds subtotal', () => {
      const discount: Discount = {
        type: DiscountType.FIXED,
        value: 100,
      };

      const result = calculator.calculateDiscount(5000, discount);
      
      // 100 Q * 100 = 10000 cents (will be truncated to 0 in service)
      expect(result).toBe(10000);
    });
  });
});
