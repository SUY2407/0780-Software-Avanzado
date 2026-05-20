export interface IValidator<T> {
  validate(data: T): void;
}

export const ORDER_VALIDATOR = Symbol('ORDER_VALIDATOR');
