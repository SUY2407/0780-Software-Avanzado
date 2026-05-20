//Enum representing geographical zones
export enum Zone {
  METRO = 0,
  INTERIOR = 1,
  FRONTERA = 2,
}
//Enum representing types of shipping services
export enum ServiceType {
  STANDARD = 0,
  EXPRESS = 1,
  SAME_DAY = 2,
}
//Enum representing the status of an order
export enum OrderStatus {
  ACTIVE = 0,
  CANCELLED = 1,
}
//Enum representing types of discounts
export enum DiscountType {
  NONE = 0,
  PERCENT = 1,
  FIXED = 2,
}
//Interface representing a package within an order
export interface Package {
  weightKg: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
  fragile: boolean;
  declaredValueQCents: number;
}
//Interface representing a discount applied to an order
export interface Discount {
  type: DiscountType;
  value: number;
}
//Interface representing the cost breakdown of an order
export interface Breakdown {
  orderBillableKg: number;
  baseSubtotalCents: number;
  serviceSubtotalCents: number;
  fragileSurchargeCents: number;
  insuranceSurchargeCents: number;
  subtotalWithSurchargesCents: number;
  discountAmountCents: number;
  totalCents: number;
}
//Interface representing an order in the QuetzalShip system
export interface Order {
  orderId: string;
  createdAt: Date;
  originZone: Zone;
  destinationZone: Zone;
  serviceType: ServiceType;
  packages: Package[];
  discount: Discount;
  insuranceEnabled: boolean;
  status: OrderStatus;
  breakdown: Breakdown;
  totalCents: number;
}
