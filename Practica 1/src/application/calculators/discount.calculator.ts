import { Injectable } from '@nestjs/common';
import { IDiscountCalculator } from './calculator.interface';
import { Discount, DiscountType } from '../../interfaces/order.interface';

@Injectable()
export class DiscountCalculator implements IDiscountCalculator {
  private readonly CENTS_PER_QUETZAL = 100;

  calculateDiscount(subtotal: number, discount: Discount): number {
    if (!discount || discount.type === DiscountType.NONE) {
      return 0;
    }

    if (discount.type === DiscountType.PERCENT) {
      return Math.round((discount.value / 100) * subtotal);
    }

    if (discount.type === DiscountType.FIXED) {
      return Math.round(discount.value * this.CENTS_PER_QUETZAL);
    }

    return 0;
  }
}
