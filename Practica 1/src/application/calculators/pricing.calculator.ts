import { Injectable } from '@nestjs/common';
import { IPricingCalculator } from './calculator.interface';
import { Package, Zone, ServiceType } from '../../interfaces/order.interface';

@Injectable()
export class PricingCalculator implements IPricingCalculator {
  // OCP: Si necesitamos agregar zonas, solo agregamos aquí
  private readonly ZONE_RATES: Record<Zone, number> = {
    [Zone.METRO]: 8,
    [Zone.INTERIOR]: 12,
    [Zone.FRONTERA]: 16,
  };

  // OCP: Si necesitamos agregar servicios, solo agregamos aquí
  private readonly SERVICE_MULTIPLIERS: Record<ServiceType, number> = {
    [ServiceType.STANDARD]: 1.0,
    [ServiceType.EXPRESS]: 1.35,
    [ServiceType.SAME_DAY]: 1.8,
  };

  private readonly FRAGILE_SURCHARGE_QUETZALES = 7;
  private readonly INSURANCE_RATE = 0.025;
  private readonly CENTS_PER_QUETZAL = 100;

  calculateBaseSubtotal(billableKg: number, zone: Zone): number {
    const ratePerKg = this.ZONE_RATES[zone];
    return Math.round(billableKg * ratePerKg * this.CENTS_PER_QUETZAL);
  }

  calculateServiceSubtotal(baseSubtotal: number, serviceType: ServiceType): number {
    const multiplier = this.SERVICE_MULTIPLIERS[serviceType];
    return Math.round(baseSubtotal * multiplier);
  }

  calculateFragileSurcharge(packages: Package[]): number {
    const fragileCount = packages.filter((p) => p.fragile).length;
    return fragileCount * this.FRAGILE_SURCHARGE_QUETZALES * this.CENTS_PER_QUETZAL;
  }

  calculateInsuranceSurcharge(packages: Package[]): number {
    const totalDeclaredValue = packages.reduce(
      (sum, pkg) => sum + pkg.declaredValueQCents,
      0,
    );
    return Math.round(totalDeclaredValue * this.INSURANCE_RATE);
  }
}
