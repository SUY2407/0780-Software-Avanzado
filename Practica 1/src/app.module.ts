import { Module } from '@nestjs/common';
import { OrderGrpcController } from './presentation/grpc/order.controller';
import { OrderService } from './application/services/order.service';
import { WeightCalculator } from './application/calculators/weight.calculator';
import { PricingCalculator } from './application/calculators/pricing.calculator';
import { DiscountCalculator } from './application/calculators/discount.calculator';
import { OrderValidator } from './application/validators/order.validator';
import { InMemoryOrderRepository } from './infrastructure/repositories/in-memory-order.repository';
import {
  ORDER_REPOSITORY,
} from './domain/repositories/order.repository.interface';
import {
  WEIGHT_CALCULATOR,
  PRICING_CALCULATOR,
  DISCOUNT_CALCULATOR,
} from './application/calculators/calculator.interface';
import { ORDER_VALIDATOR } from './application/validators/validator.interface';

@Module({
  imports: [],
  controllers: [OrderGrpcController], // ✅ Usar el controlador de la capa de presentación
  providers: [
    // Servicios de aplicación
    OrderService,
    
    // Repositorios (DIP - Inversión de dependencias)
    {
      provide: ORDER_REPOSITORY,
      useClass: InMemoryOrderRepository,
    },
    
    // Calculadoras (DIP + ISP - Interfaces segregadas)
    {
      provide: WEIGHT_CALCULATOR,
      useClass: WeightCalculator,
    },
    {
      provide: PRICING_CALCULATOR,
      useClass: PricingCalculator,
    },
    {
      provide: DISCOUNT_CALCULATOR,
      useClass: DiscountCalculator,
    },
    
    // Validadores (DIP)
    {
      provide: ORDER_VALIDATOR,
      useClass: OrderValidator,
    },
  ],
})
export class AppModule {}
