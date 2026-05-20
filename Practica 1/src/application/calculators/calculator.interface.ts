import { Package, Zone, ServiceType, Discount } from '../../interfaces/order.interface';

export interface IWeightCalculator {
  calculateVolumetricWeight(pkg: Package): number;
  calculateBillableWeight(pkg: Package): number;
  calculateTotalBillableWeight(packages: Package[]): number;
}

export interface IPricingCalculator {
  calculateBaseSubtotal(billableKg: number, zone: Zone): number;
  calculateServiceSubtotal(baseSubtotal: number, serviceType: ServiceType): number;
  calculateFragileSurcharge(packages: Package[]): number;
  calculateInsuranceSurcharge(packages: Package[]): number;
}

export interface IDiscountCalculator {
  calculateDiscount(subtotal: number, discount: Discount): number;
}

export const WEIGHT_CALCULATOR = Symbol('WEIGHT_CALCULATOR');
export const PRICING_CALCULATOR = Symbol('PRICING_CALCULATOR');
export const DISCOUNT_CALCULATOR = Symbol('DISCOUNT_CALCULATOR');
