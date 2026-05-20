import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import {
  Order,
  Package,
  Zone,
  ServiceType,
  OrderStatus,
  DiscountType,
  Breakdown,
  Discount,
} from './interfaces/order.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  // Persistencia en memoria
  private orders: Map<string, Order> = new Map();

  // TODO: Este servicio es MONOLÍTICO - toda la lógica en un solo lugar
  // En P1-REFACTOR separaremos responsabilidades

  createOrder(data: any): Order {
    // Validación
    this.validateCreateOrderRequest(data);

    // Calcular tarifas
    const breakdown = this.calculateBreakdown(
      data.packages,
      data.destinationZone,
      data.serviceType,
      data.discount,
      data.insuranceEnabled,
    );

    // Crear orden
    const order: Order = {
      orderId: uuidv4(),
      createdAt: new Date(),
      originZone: data.originZone,
      destinationZone: data.destinationZone,
      serviceType: data.serviceType,
      packages: data.packages,
      discount: data.discount || { type: DiscountType.NONE, value: 0 },
      insuranceEnabled: data.insuranceEnabled,
      status: OrderStatus.ACTIVE,
      breakdown,
      totalCents: breakdown.totalCents,
    };

    this.orders.set(order.orderId, order);
    return order;
  }

  listOrders(pageSize: number = 10, pageNumber: number = 1): any {
    const allOrders = Array.from(this.orders.values());
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    const paginatedOrders = allOrders.slice(start, end);

    return {
      orders: paginatedOrders.map((o) => ({
        orderId: o.orderId,
        destinationZone: o.destinationZone,
        serviceType: o.serviceType,
        status: o.status,
        totalCents: o.totalCents,
      })),
      totalCount: allOrders.length,
    };
  }

  getOrder(orderId: string): Order {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Order with ID ${orderId} not found`,
      });
    }
    return order;
  }

  cancelOrder(orderId: string): Order {
    const order = this.orders.get(orderId);
    
    if (!order) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Order with ID ${orderId} not found`,
      });
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: `Order ${orderId} is already cancelled`,
      });
    }

    order.status = OrderStatus.CANCELLED;
    this.orders.set(orderId, order);
    return order;
  }

  getReceipt(orderId: string): any {
    const order = this.getOrder(orderId);
    return {
      orderId: order.orderId,
      createdAt: order.createdAt,
      originZone: order.originZone,
      destinationZone: order.destinationZone,
      serviceType: order.serviceType,
      status: order.status,
      packages: order.packages,
      breakdown: order.breakdown,
      totalCents: order.totalCents,
    };
  }

  // VALIDACIONES (TODO: mover a clase separada en REFACTOR)
  private validateCreateOrderRequest(data: any): void {
    if (!data.packages || data.packages.length === 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'At least one package is required',
      });
    }

    for (const pkg of data.packages) {
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

    // Validar seguro
    if (data.insuranceEnabled) {
      const totalDeclaredValue = data.packages.reduce(
        (sum: number, pkg: Package) => sum + pkg.declaredValueQCents,
        0,
      );
      if (totalDeclaredValue === 0) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Insurance enabled but total declared value is 0',
        });
      }
    }

    // Validar descuento PERCENT
    if (data.discount && data.discount.type === DiscountType.PERCENT) {
      if (data.discount.value > 35) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Percent discount cannot exceed 35%',
        });
      }
    }
  }

  // CÁLCULOS (TODO: mover a clase separada en REFACTOR)
  private calculateBreakdown(
    packages: Package[],
    destinationZone: Zone,
    serviceType: ServiceType,
    discount: Discount,
    insuranceEnabled: boolean,
  ): Breakdown {
    // 1. Peso volumétrico y tarifable por paquete
    let orderBillableKg = 0;
    for (const pkg of packages) {
      const volumetricKg = (pkg.heightCm * pkg.widthCm * pkg.lengthCm) / 5000;
      const billableKg = Math.max(pkg.weightKg, volumetricKg);
      orderBillableKg += billableKg;
    }

    // 2. Tarifa base por zona
    const zoneRates = {
      [Zone.METRO]: 8,
      [Zone.INTERIOR]: 12,
      [Zone.FRONTERA]: 16,
    };
    const ratePerKg = zoneRates[destinationZone];
    const baseSubtotalCents = Math.round(orderBillableKg * ratePerKg * 100);

    // 3. Multiplicador por tipo de servicio
    const serviceMultipliers = {
      [ServiceType.STANDARD]: 1.0,
      [ServiceType.EXPRESS]: 1.35,
      [ServiceType.SAME_DAY]: 1.8,
    };
    const multiplier = serviceMultipliers[serviceType];
    const serviceSubtotalCents = Math.round(baseSubtotalCents * multiplier);

    // 4. Recargos
    const fragileCount = packages.filter((p) => p.fragile).length;
    const fragileSurchargeCents = fragileCount * 7 * 100; // 7 quetzales por paquete frágil

    let insuranceSurchargeCents = 0;
    if (insuranceEnabled) {
      const totalDeclaredValue = packages.reduce(
        (sum, pkg) => sum + pkg.declaredValueQCents,
        0,
      );
      insuranceSurchargeCents = Math.round(totalDeclaredValue * 0.025);
    }

    const subtotalWithSurchargesCents =
      serviceSubtotalCents + fragileSurchargeCents + insuranceSurchargeCents;

    // 5. Descuento
    let discountAmountCents = 0;
    if (discount) {
      if (discount.type === DiscountType.PERCENT) {
        discountAmountCents = Math.round(
          (discount.value / 100) * subtotalWithSurchargesCents,
        );
      } else if (discount.type === DiscountType.FIXED) {
        discountAmountCents = Math.round(discount.value * 100);
      }
    }

    // 6. Total (no puede ser negativo)
    let totalCents = subtotalWithSurchargesCents - discountAmountCents;
    if (totalCents < 0) {
      totalCents = 0;
    }

    return {
      orderBillableKg,
      baseSubtotalCents,
      serviceSubtotalCents,
      fragileSurchargeCents,
      insuranceSurchargeCents,
      subtotalWithSurchargesCents,
      discountAmountCents,
      totalCents,
    };
  }
}
