import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Domain
import { ORDER_REPOSITORY } from './domain/repositories/order.repository.interface';

// Application
import {
  CreateOrderUseCase,
  CreateOrderFromCartUseCase,
  GetOrderUseCase,
  GetOrdersByUserUseCase,
  GetAllOrdersUseCase,
  UpdateOrderStatusUseCase,
} from './application/use-cases';
import { AUTH_CLIENT } from './application/interfaces/auth-client.interface';
import { CART_CLIENT } from './application/interfaces/cart-client.interface';
import { CATALOG_CLIENT } from './application/interfaces/catalog-client.interface';

// Infrastructure
import { OrderEntity } from './infrastructure/database/entities/order.entity';
import { OrderItemEntity } from './infrastructure/database/entities/order-item.entity';
import { OrderRepository } from './infrastructure/database/repositories/order.repository';
import { AuthGrpcClient } from './infrastructure/grpc/clients/auth-grpc.client';
import { CartGrpcClient } from './infrastructure/grpc/clients/cart-grpc.client';
import { CatalogGrpcClient } from './infrastructure/grpc/clients/catalog-grpc.client';

// Presentation
import { OrdersController } from './presentation/rest/controllers/orders.controller';
import { OrdersGrpcController } from './presentation/grpc/orders-grpc.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
  ],
  controllers: [OrdersController, OrdersGrpcController],
  providers: [
    // Use Cases
    CreateOrderUseCase,
    CreateOrderFromCartUseCase,
    GetOrderUseCase,
    GetOrdersByUserUseCase,
    GetAllOrdersUseCase,
    UpdateOrderStatusUseCase,

    // Repository
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepository,
    },

    // External Clients
    {
      provide: AUTH_CLIENT,
      useClass: AuthGrpcClient,
    },
    {
      provide: CART_CLIENT,
      useClass: CartGrpcClient,
    },
    {
      provide: CATALOG_CLIENT,
      useClass: CatalogGrpcClient,
    },
  ],
  exports: [
    CreateOrderUseCase,
    CreateOrderFromCartUseCase,
    GetOrderUseCase,
    GetOrdersByUserUseCase,
    GetAllOrdersUseCase,
    UpdateOrderStatusUseCase,
  ],
})
export class OrdersModule {}
