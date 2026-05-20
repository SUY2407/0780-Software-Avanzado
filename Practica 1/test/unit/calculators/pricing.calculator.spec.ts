import { PricingCalculator } from '../../../src/application/calculators/pricing.calculator';
import { Package, Zone, ServiceType } from '../../../src/interfaces/order.interface';

describe('PricingCalculator', () => {
  let calculator: PricingCalculator;

  beforeEach(() => {
    calculator = new PricingCalculator();
  });

  describe('calculateBaseSubtotal', () => {
    it('should calculate base subtotal for METRO zone', () => {
      const result = calculator.calculateBaseSubtotal(5, Zone.METRO);
      
      // 5 kg * 8 Q/kg * 100 = 4000 cents
      expect(result).toBe(4000);
    });

    it('should calculate base subtotal for INTERIOR zone', () => {
      const result = calculator.calculateBaseSubtotal(7.8, Zone.INTERIOR);
      
      // 7.8 kg * 12 Q/kg * 100 = 9360 cents
      expect(result).toBe(9360);
    });

    it('should calculate base subtotal for FRONTERA zone', () => {
      const result = calculator.calculateBaseSubtotal(25, Zone.FRONTERA);
      
      // 25 kg * 16 Q/kg * 100 = 40000 cents
      expect(result).toBe(40000);
    });
  });

  describe('calculateServiceSubtotal', () => {
    it('should apply STANDARD multiplier (1.0)', () => {
      const result = calculator.calculateServiceSubtotal(4000, ServiceType.STANDARD);
      
      // 4000 * 1.0 = 4000
      expect(result).toBe(4000);
    });

    it('should apply EXPRESS multiplier (1.35)', () => {
      const result = calculator.calculateServiceSubtotal(9360, ServiceType.EXPRESS);
      
      // 9360 * 1.35 = 12636
      expect(result).toBe(12636);
    });

    it('should apply SAME_DAY multiplier (1.8)', () => {
      const result = calculator.calculateServiceSubtotal(40000, ServiceType.SAME_DAY);
      
      // 40000 * 1.8 = 72000
      expect(result).toBe(72000);
    });
  });

  describe('calculateFragileSurcharge', () => {
    it('should return 0 when no fragile packages', () => {
      const packages: Package[] = [
        {
          weightKg: 5,
          heightCm: 30,
          widthCm: 20,
          lengthCm: 10,
          fragile: false,
          declaredValueQCents: 0,
        },
      ];

      const result = calculator.calculateFragileSurcharge(packages);
      expect(result).toBe(0);
    });

    it('should calculate surcharge for fragile packages', () => {
      const packages: Package[] = [
        {
          weightKg: 2,
          heightCm: 40,
          widthCm: 30,
          lengthCm: 20,
          fragile: true,
          declaredValueQCents: 0,
        },
        {
          weightKg: 3,
          heightCm: 25,
          widthCm: 25,
          lengthCm: 15,
          fragile: true,
          declaredValueQCents: 0,
        },
      ];

      const result = calculator.calculateFragileSurcharge(packages);
      
      // 2 packages * 7 Q * 100 = 1400 cents
      expect(result).toBe(1400);
    });
  });

  describe('calculateInsuranceSurcharge', () => {
    it('should calculate insurance surcharge correctly', () => {
      const packages: Package[] = [
        {
          weightKg: 2,
          heightCm: 40,
          widthCm: 30,
          lengthCm: 20,
          fragile: false,
          declaredValueQCents: 50000,
        },
        {
          weightKg: 3,
          heightCm: 25,
          widthCm: 25,
          lengthCm: 15,
          fragile: false,
          declaredValueQCents: 30000,
        },
      ];

      const result = calculator.calculateInsuranceSurcharge(packages);
      
      // (50000 + 30000) * 0.025 = 2000 cents
      expect(result).toBe(2000);
    });
  });
});
