export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  constructor(amount: number, currency: string = 'GTQ') {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    this._amount = Math.round(amount * 100) / 100;
    this._currency = currency.toUpperCase();
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  public add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amount + other.amount, this._currency);
  }

  public subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this._amount - other.amount;
    if (result < 0) {
      throw new Error('Result cannot be negative');
    }
    return new Money(result, this._currency);
  }

  public multiply(factor: number): Money {
    return new Money(this._amount * factor, this._currency);
  }

  public equals(other: Money): boolean {
    return this._amount === other.amount && this._currency === other.currency;
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other.currency) {
      throw new Error(
        `Cannot operate on different currencies: ${this._currency} and ${other.currency}`,
      );
    }
  }

  public toString(): string {
    return `${this._currency} ${this._amount.toFixed(2)}`;
  }
}
