import { WeightCalculator } from '../../../src/application/calculators/weight.calculator';
import { Package } from '../../../src/interfaces/order.interface';

describe('WeightCalculator', () => {
  let calculator: WeightCalculator;

  beforeEach(() => {
    calculator = new WeightCalculator();
  });

  describe('calculateVolumetricWeight', () => {
    it('should calculate volumetric weight correctly', () => {
      const pkg: Package = {
        weightKg: 5,
        heightCm: 30,
        widthCm: 20,
        lengthCm: 10,
        fragile: false,
        declaredValueQCents: 0,
      };

      const result = calculator.calculateVolumetricWeight(pkg);
      
      // (30 * 20 * 10) / 5000 = 1.2
      expect(result).toBe(1.2);
    });

    it('should calculate volumetric weight for larger package', () => {
      const pkg: Package = {
        weightKg: 10,
        heightCm: 50,
        widthCm: 50,
        lengthCm: 50,
        fragile: false,
        declaredValueQCents: 0,
      };

      const result = calculator.calculateVolumetricWeight(pkg);
      
      // (50 * 50 * 50) / 5000 = 25
      expect(result).toBe(25);
    });
  });

  describe('calculateBillableWeight', () => {
    it('should use actual weight when greater than volumetric', () => {
      const pkg: Package = {
        weightKg: 5,
        heightCm: 30,
        widthCm: 20,
        lengthCm: 10,
        fragile: false,
        declaredValueQCents: 0,
      };

      const result = calculator.calculateBillableWeight(pkg);
      
      // max(5, 1.2) = 5
      expect(result).toBe(5);
    });

    it('should use volumetric weight when greater than actual', () => {
      const pkg: Package = {
        weightKg: 10,
        heightCm: 50,
        widthCm: 50,
        lengthCm: 50,
        fragile: false,
        declaredValueQCents: 0,
      };

      const result = calculator.calculateBillableWeight(pkg);
      
      // max(10, 25) = 25
      expect(result).toBe(25);
    });
  });

  describe('calculateTotalBillableWeight', () => {
    it('should sum billable weights from multiple packages', () => {
      const packages: Package[] = [
        {
          weightKg: 2,
          heightCm: 40,
          widthCm: 30,
          lengthCm: 20,
          fragile: false,
          declaredValueQCents: 0,
        },
        {
          weightKg: 3,
          heightCm: 25,
          widthCm: 25,
          lengthCm: 15,
          fragile: false,
          declaredValueQCents: 0,
        },
      ];

      const result = calculator.calculateTotalBillableWeight(packages);
      
      // Package 1: max(2, 4.8) = 4.8
      // Package 2: max(3, 1.875) = 3
      // Total: 7.8
      expect(result).toBe(7.8);
    });
  });
});
