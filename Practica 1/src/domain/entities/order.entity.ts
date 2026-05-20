import {
  Order as IOrder,
  Package,
  Zone,
  ServiceType,
  Discount,
  DiscountType,
  OrderStatus,
  Breakdown,
} from '../../interfaces/order.interface';

/**
 * Order Entity - Representa la entidad de dominio con su lógica de negocio
 * Principio SRP: La entidad conoce sus propias reglas de negocio
 */
export class OrderEntity implements IOrder {
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

  constructor(data: Partial<IOrder>) {
    this.orderId = data.orderId || '';
    this.createdAt = data.createdAt || new Date();
    this.originZone = data.originZone!;
    this.destinationZone = data.destinationZone!;
    this.serviceType = data.serviceType!;
    this.packages = data.packages || [];
    this.discount = data.discount || { type: DiscountType.NONE, value: 0 };
    this.insuranceEnabled = data.insuranceEnabled || false;
    this.status = data.status || OrderStatus.ACTIVE;
    this.breakdown = data.breakdown!;
    this.totalCents = data.totalCents || 0;
  }

  /**
   * Regla de negocio: una orden puede ser cancelada solo si está activa
   */
  canBeCancelled(): boolean {
    return this.status === OrderStatus.ACTIVE;
  }

  /**
   * Cancela la orden (congela el estado)
   */
  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error('Order cannot be cancelled');
    }
    this.status = OrderStatus.CANCELLED;
  }

  /**
   * Verifica si la orden está activa
   */
  isActive(): boolean {
    return this.status === OrderStatus.ACTIVE;
  }

  /**
   * Verifica si la orden está cancelada
   */
  isCancelled(): boolean {
    return this.status === OrderStatus.CANCELLED;
  }

  /**
   * Obtiene el total en quetzales (para presentación)
   */
  getTotalInQuetzales(): number {
    return this.totalCents / 100;
  }

  /**
   * Convierte la entidad a objeto plano para persistencia
   */
  toPlainObject(): IOrder {
    return {
      orderId: this.orderId,
      createdAt: this.createdAt,
      originZone: this.originZone,
      destinationZone: this.destinationZone,
      serviceType: this.serviceType,
      packages: this.packages,
      discount: this.discount,
      insuranceEnabled: this.insuranceEnabled,
      status: this.status,
      breakdown: this.breakdown,
      totalCents: this.totalCents,
    };
  }

  /**
   * Factory method: crea una entidad desde un objeto plano*/
  static fromPlainObject(data: IOrder): OrderEntity {
    return new OrderEntity(data);
  }
}
