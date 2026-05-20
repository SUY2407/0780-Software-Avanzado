import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { IValidator } from './validator.interface';
import { Package, DiscountType } from '../../interfaces/order.interface';

export interface CreateOrderData {
  packages: Package[];
  insuranceEnabled: boolean;
  discount?: { type: DiscountType; value: number };
}

@Injectable()
export class OrderValidator implements IValidator<CreateOrderData> {
  private readonly MAX_PERCENT_DISCOUNT = 35;

  validate(data: CreateOrderData): void {
    this.validatePackages(data.packages);
    this.validateInsurance(data.packages, data.insuranceEnabled);
    this.validateDiscount(data.discount);
  }

  private validatePackages(packages: Package[]): void {
    if (!packages || packages.length === 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'At least one package is required',
      });
    }

    for (const pkg of packages) {
      if (pkg.weightKg <= 0) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Package weight must be greater than 0',
        });
      }

      if (pkg.heightCm <= 0 || pkg.widthCm <= 0 || pkg.lengthCm <= 0) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Package dimensions must be greater than 0',
        });
      }

      if (pkg.declaredValueQCents < 0) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Declared value cannot be negative',
        });
      }
    }
  }

  private validateInsurance(packages: Package[], insuranceEnabled: boolean): void {
    if (insuranceEnabled) {
      const totalDeclaredValue = packages.reduce(
        (sum, pkg) => sum + pkg.declaredValueQCents,
        0,
      );

      if (totalDeclaredValue === 0) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Insurance enabled but total declared value is 0',
        });
      }
    }
  }

  private validateDiscount(discount?: { type: DiscountType; value: number }): void {
    if (discount && discount.type === DiscountType.PERCENT) {
      if (discount.value > this.MAX_PERCENT_DISCOUNT) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: `Percent discount cannot exceed ${this.MAX_PERCENT_DISCOUNT}%`,
        });
      }
    }
  }
}
