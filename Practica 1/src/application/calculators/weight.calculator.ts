import { Injectable } from '@nestjs/common';
import { IWeightCalculator } from './calculator.interface';
import { Package } from '../../interfaces/order.interface';

@Injectable()
export class WeightCalculator implements IWeightCalculator {
  private readonly VOLUMETRIC_DIVISOR = 5000;

  calculateVolumetricWeight(pkg: Package): number {
    return (pkg.heightCm * pkg.widthCm * pkg.lengthCm) / this.VOLUMETRIC_DIVISOR;
  }

  calculateBillableWeight(pkg: Package): number {
    const volumetricWeight = this.calculateVolumetricWeight(pkg);
    return Math.max(pkg.weightKg, volumetricWeight);
  }

  calculateTotalBillableWeight(packages: Package[]): number {
    return packages.reduce((total, pkg) => {
      return total + this.calculateBillableWeight(pkg);
    }, 0);
  }
}
