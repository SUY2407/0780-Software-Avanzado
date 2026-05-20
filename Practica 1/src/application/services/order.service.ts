import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { v4 as uuidv4 } from 'uuid';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import type {
  IWeightCalculator,
  IPricingCalculator,
  IDiscountCalculator,
} from '../calculators/calculator.interface';
import {
  WEIGHT_CALCULATOR,
  PRICING_CALCULATOR,
  DISCOUNT_CALCULATOR,
} from '../calculators/calculator.interface';
import type { IValidator } from '../validators/validator.interface';
import { ORDER_VALIDATOR } from '../validators/validator.interface';
import {
  Order,
  Package,
  Zone,
  ServiceType,
  Discount,
  DiscountType,
  OrderStatus,
  Breakdown,
} from '../../interfaces/order.interface';
import { OrderEntity } from '../../domain/entities/order.entity';

export interface CreateOrderDto {
  originZone: Zone;
  destinationZone: Zone;
  serviceType: ServiceType;
  packages: Package[];
  discount?: Discount;
  insuranceEnabled: boolean;
}

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(WEIGHT_CALCULATOR)
    private readonly weightCalculator: IWeightCalculator,
    @Inject(PRICING_CALCULATOR)
    private readonly pricingCalculator: IPricingCalculator,
    @Inject(DISCOUNT_CALCULATOR)
    private readonly discountCalculator: IDiscountCalculator,
    @Inject(ORDER_VALIDATOR)
    private readonly orderValidator: IValidator<any>,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Validar
    this.orderValidator.validate(dto);

    // Calcular breakdown
    const breakdown = this.calculateBreakdown(
      dto.packages,
      dto.destinationZone,
      dto.serviceType,
      dto.discount || { type: DiscountType.NONE, value: 0 },
      dto.insuranceEnabled,
    );

    // Crear entidad de dominio
    const orderEntity = new OrderEntity({
      orderId: uuidv4(),
      createdAt: new Date(),
      originZone: dto.originZone,
      destinationZone: dto.destinationZone,
      serviceType: dto.serviceType,
      packages: dto.packages,
      discount: dto.discount || { type: DiscountType.NONE, value: 0 },
      insuranceEnabled: dto.insuranceEnabled,
      status: OrderStatus.ACTIVE,
      breakdown,
      totalCents: breakdown.totalCents,
    });

    // Persistir
    return await this.orderRepository.save(orderEntity.toPlainObject());
  }

  async listOrders(
    pageSize: number = 10,
    pageNumber: number = 1,
  ): Promise<{ orders: Order[]; totalCount: number }> {
    return await this.orderRepository.findAll(pageSize, pageNumber);
  }

  async getOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Order with ID ${orderId} not found`,
      });
    }
    return order;
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const orderData = await this.getOrder(orderId);
    
    // Convertir a entidad de dominio para aplicar reglas de negocio
    const orderEntity = OrderEntity.fromPlainObject(orderData);

    // Validar y cancelar usando la lógica de la entidad
    if (!orderEntity.canBeCancelled()) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: `Order ${orderId} is already cancelled`,
      });
    }

    orderEntity.cancel();

    // Persistir cambios
    return await this.orderRepository.update(orderEntity.toPlainObject());
  }

  async getReceipt(orderId: string): Promise<Order> {
    return await this.getOrder(orderId);
  }

  // Método privado que usa las calculadoras inyectadas
  private calculateBreakdown(
    packages: Package[],
    destinationZone: Zone,
    serviceType: ServiceType,
    discount: Discount,
    insuranceEnabled: boolean,
  ): Breakdown {
    // 1. Peso tarifable total
    const orderBillableKg = this.weightCalculator.calculateTotalBillableWeight(packages);

    // 2. Subtotal base
    const baseSubtotalCents = this.pricingCalculator.calculateBaseSubtotal(
      orderBillableKg,
      destinationZone,
    );

    // 3. Subtotal con servicio
    const serviceSubtotalCents = this.pricingCalculator.calculateServiceSubtotal(
      baseSubtotalCents,
      serviceType,
    );

    // 4. Recargos
    const fragileSurchargeCents = this.pricingCalculator.calculateFragileSurcharge(packages);
    const insuranceSurchargeCents = insuranceEnabled
      ? this.pricingCalculator.calculateInsuranceSurcharge(packages)
      : 0;

    const subtotalWithSurchargesCents =
      serviceSubtotalCents + fragileSurchargeCents + insuranceSurchargeCents;

    // 5. Descuento
    const discountAmountCents = this.discountCalculator.calculateDiscount(
      subtotalWithSurchargesCents,
      discount,
    );

    // 6. Total
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
