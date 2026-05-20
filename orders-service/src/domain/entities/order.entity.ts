import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../value-objects/order-status.vo';
import { Money } from '../value-objects/money.vo';
import { DomainException } from '../exceptions/domain.exception';

export interface OrderProps {
  id?: string;
  userId: number;
  total: Money;
  status: OrderStatus;
  paymentReference?: string;
  items: OrderItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order {
  private readonly _id: string | undefined;
  private readonly _userId: number;
  private _total: Money;
  private _status: OrderStatus;
  private _paymentReference: string | undefined;
  private _items: OrderItem[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: OrderProps) {
    this.validateProps(props);
    this._id = props.id;
    this._userId = props.userId;
    this._total = props.total;
    this._status = props.status;
    this._paymentReference = props.paymentReference;
    this._items = props.items;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  private validateProps(props: OrderProps): void {
    if (!props.userId || props.userId <= 0) {
      throw new DomainException('User ID must be a positive number');
    }
    if (!props.items || props.items.length === 0) {
      throw new DomainException('Order must have at least one item');
    }
  }

  get id(): string | undefined {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get total(): Money {
    return this._total;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get paymentReference(): string | undefined {
    return this._paymentReference;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateStatus(newStatus: OrderStatus): void {
    if (!this._status.canTransitionTo(newStatus)) {
      throw new DomainException(
        `Cannot transition from ${this._status.value} to ${newStatus.value}`,
      );
    }
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  public setPaymentReference(reference: string): void {
    if (!reference || reference.trim() === '') {
      throw new DomainException('Payment reference cannot be empty');
    }
    this._paymentReference = reference;
    this._updatedAt = new Date();
  }

  public calculateTotal(): Money {
    const totalAmount = this._items.reduce(
      (sum, item) => sum + item.subtotal.amount,
      0,
    );
    this._total = new Money(totalAmount, this._total.currency);
    return this._total;
  }

  public confirm(): void {
    this.updateStatus(OrderStatus.confirmed());
  }
}
