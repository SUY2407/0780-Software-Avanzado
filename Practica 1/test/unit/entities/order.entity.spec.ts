import { OrderEntity } from '../../../src/domain/entities/order.entity';
import { Zone, ServiceType, OrderStatus, DiscountType } from '../../../src/interfaces/order.interface';

describe('OrderEntity', () => {
  const validOrderData = {
    orderId: 'test-order-id',
    createdAt: new Date(),
    originZone: Zone.METRO,
    destinationZone: Zone.INTERIOR,
    serviceType: ServiceType.STANDARD,
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
    discount: { type: DiscountType.NONE, value: 0 },
    insuranceEnabled: false,
    status: OrderStatus.ACTIVE,
    breakdown: {
      orderBillableKg: 5,
      baseSubtotalCents: 4000,
      serviceSubtotalCents: 4000,
      fragileSurchargeCents: 0,
      insuranceSurchargeCents: 0,
      subtotalWithSurchargesCents: 4000,
      discountAmountCents: 0,
      totalCents: 4000,
    },
    totalCents: 4000,
  };

  describe('constructor', () => {
    it('should create an order entity with all properties', () => {
      const order = new OrderEntity(validOrderData);

      expect(order.orderId).toBe('test-order-id');
      expect(order.status).toBe(OrderStatus.ACTIVE);
      expect(order.totalCents).toBe(4000);
    });
  });

  describe('canBeCancelled', () => {
    it('should return true when order is active', () => {
      const order = new OrderEntity(validOrderData);

      expect(order.canBeCancelled()).toBe(true);
    });

    it('should return false when order is already cancelled', () => {
      const order = new OrderEntity({
        ...validOrderData,
        status: OrderStatus.CANCELLED,
      });

      expect(order.canBeCancelled()).toBe(false);
    });
  });

  describe('cancel', () => {
    it('should cancel an active order', () => {
      const order = new OrderEntity(validOrderData);

      order.cancel();

      expect(order.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw error when trying to cancel already cancelled order', () => {
      const order = new OrderEntity({
        ...validOrderData,
        status: OrderStatus.CANCELLED,
      });

      expect(() => order.cancel()).toThrow('Order cannot be cancelled');
    });
  });

  describe('isActive', () => {
    it('should return true for active order', () => {
      const order = new OrderEntity(validOrderData);

      expect(order.isActive()).toBe(true);
    });

    it('should return false for cancelled order', () => {
      const order = new OrderEntity({
        ...validOrderData,
        status: OrderStatus.CANCELLED,
      });

      expect(order.isActive()).toBe(false);
    });
  });

  describe('getTotalInQuetzales', () => {
    it('should convert cents to quetzales', () => {
      const order = new OrderEntity(validOrderData);

      expect(order.getTotalInQuetzales()).toBe(40);
    });
  });

  describe('toPlainObject', () => {
    it('should convert entity to plain object', () => {
      const order = new OrderEntity(validOrderData);
      const plain = order.toPlainObject();

      expect(plain.orderId).toBe('test-order-id');
      expect(plain.totalCents).toBe(4000);
    });
  });

  describe('fromPlainObject', () => {
    it('should create entity from plain object', () => {
      const order = OrderEntity.fromPlainObject(validOrderData);

      expect(order).toBeInstanceOf(OrderEntity);
      expect(order.orderId).toBe('test-order-id');
    });
  });
});
