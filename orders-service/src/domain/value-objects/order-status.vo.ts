export enum OrderStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
}

const VALID_TRANSITIONS: Record<OrderStatusEnum, OrderStatusEnum[]> = {
  [OrderStatusEnum.PENDING]: [OrderStatusEnum.CONFIRMED],
  [OrderStatusEnum.CONFIRMED]: [OrderStatusEnum.CONFIRMED], // Allow idempotent confirmations
};

export class OrderStatus {
  private readonly _value: OrderStatusEnum;

  private constructor(value: OrderStatusEnum) {
    this._value = value;
  }

  get value(): OrderStatusEnum {
    return this._value;
  }

  public static pending(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PENDING);
  }

  public static confirmed(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.CONFIRMED);
  }

  public static fromString(value: string): OrderStatus {
    const upperValue = value.toUpperCase() as OrderStatusEnum;
    if (!Object.values(OrderStatusEnum).includes(upperValue)) {
      throw new Error(`Invalid order status: ${value}`);
    }
    return new OrderStatus(upperValue);
  }

  public canTransitionTo(newStatus: OrderStatus): boolean {
    const allowedTransitions = VALID_TRANSITIONS[this._value];
    return allowedTransitions.includes(newStatus.value);
  }

  public equals(other: OrderStatus): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
