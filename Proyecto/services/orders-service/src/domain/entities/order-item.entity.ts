import { Money } from '../value-objects/money.vo';
import { DomainException } from '../exceptions/domain.exception';

export interface OrderItemProps {
  id?: string;
  orderId?: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: Money;
  subtotal?: Money;
}

export class OrderItem {
  private readonly _id: string | undefined;
  private _orderId: string | undefined;
  private readonly _productId: number;
  private readonly _productName: string;
  private readonly _quantity: number;
  private readonly _unitPrice: Money;
  private readonly _subtotal: Money;

  constructor(props: OrderItemProps) {
    this.validateProps(props);
    this._id = props.id;
    this._orderId = props.orderId;
    this._productId = props.productId;
    this._productName = props.productName;
    this._quantity = props.quantity;
    this._unitPrice = props.unitPrice;
    this._subtotal =
      props.subtotal ?? this.calculateSubtotal(props.unitPrice, props.quantity);
  }

  private validateProps(props: OrderItemProps): void {
    if (!props.productId || props.productId <= 0) {
      throw new DomainException('Product ID must be a positive number');
    }
    if (!props.productName || props.productName.trim() === '') {
      throw new DomainException('Product name cannot be empty');
    }
    if (!props.quantity || props.quantity <= 0) {
      throw new DomainException('Quantity must be a positive number');
    }
    if (!props.unitPrice || props.unitPrice.amount < 0) {
      throw new DomainException('Unit price cannot be negative');
    }
  }

  private calculateSubtotal(unitPrice: Money, quantity: number): Money {
    return new Money(unitPrice.amount * quantity, unitPrice.currency);
  }

  get id(): string | undefined {
    return this._id;
  }

  get orderId(): string | undefined {
    return this._orderId;
  }

  get productId(): number {
    return this._productId;
  }

  get productName(): string {
    return this._productName;
  }

  get quantity(): number {
    return this._quantity;
  }

  get unitPrice(): Money {
    return this._unitPrice;
  }

  get subtotal(): Money {
    return this._subtotal;
  }

  public setOrderId(orderId: string): void {
    this._orderId = orderId;
  }
}
