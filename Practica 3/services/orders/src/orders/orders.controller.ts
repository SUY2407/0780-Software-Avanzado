import { Controller, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { OrdersService } from './orders.service';

// Interfaz para el cliente Pricing
interface PricingService {
  CalculatePrice(data: any): Observable<any>;
}

@Controller()
export class OrdersController implements OnModuleInit {
  private readonly logger = new Logger(OrdersController.name);
  private pricingService: PricingService;

  constructor(
    @Inject('PRICING_PACKAGE') private client: ClientGrpc,
    private readonly ordersService: OrdersService,
  ) { }

  onModuleInit() {
    this.pricingService = this.client.getService<PricingService>('PricingService');
  }

  @GrpcMethod('OrdersService', 'CreateOrder')
  async createOrder(data: any) {
    console.log('OrdersService: Creating order...');

    try {
      this.logger.log(`Creating order for origin: ${data.origin_zone} -> ${data.estination_zone}`);
      // 1. Llamar a Pricing Service para calcular
      const priceResponse = await lastValueFrom(
        this.pricingService.CalculatePrice({
          origin_zone: data.origin_zone,
          destination_zone: data.destination_zone,
          service_type: data.service_type,
          packages: data.packages,
          insurance_enabled: data.insurance_enabled,
          discount: data.discount,
        }),
      );

      // 2. Persistir en MSSQL usando el servicio
      const order = await this.ordersService.createOrder({
        origin_zone: data.origin_zone,
        destination_zone: data.destination_zone,
        service_type: data.service_type,
        packages: data.packages,
        discount: data.discount,
        insurance_enabled: data.insurance_enabled,
        breakdown: priceResponse.breakdown,
        total: priceResponse.total,
      });
      this.logger.log(`Order created successfully: ${order.order_id}`);

      console.log(`Order created and persisted: ${order.order_id}`);
      return order;

    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      console.error('Error creating order:', error);
      throw new RpcException({
        code: 13, // INTERNAL
        message: error.message || 'Failed to create order',
      });
    }
  }

  @GrpcMethod('OrdersService', 'ListOrders')
  async listOrders() {
    try {
      this.logger.log(`Listing orders `);
      const orders = await this.ordersService.listOrders();
      return { orders };
    } catch (error) {
      this.logger.error(`Failed to list orders: ${error.message}`, error.stack);
      console.error('Error listing orders:', error);
      throw new RpcException({
        code: 13,
        message: 'Failed to list orders',
      });
    }
  }

  @GrpcMethod('OrdersService', 'GetOrder')
  async getOrder(data: { order_id: string }) {
    const orderId = data.order_id;
    try {
      this.logger.log(`Retrieving order ${orderId}`);
      const order = await this.ordersService.getOrder(data.order_id);

      if (!order) {
        throw new RpcException({
          code: 5, // NOT_FOUND
          message: 'Order not found'
        });
      }
      this.logger.log(`Order ${orderId} retrieved successfully`);
      return order;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Failed to retrieve order ${orderId}: ${error.message}`, error.stack);
      console.error('Error getting order:', error);
      throw new RpcException({
        code: 13,
        message: 'Failed to get order',
      });
    }
  }

  @GrpcMethod('OrdersService', 'CancelOrder')
  async cancelOrder(data: { order_id: string }) {
    const orderId = data.order_id;
    this.logger.log(`Cancelling order ${orderId}`);
    try {
      const order = await this.ordersService.cancelOrder(data.order_id);

      if (!order) {
        throw new RpcException({
          code: 5,
          message: 'Order not found'
        });
      }
      this.logger.log(`Order ${orderId} cancelled successfully`);
      return order;
    } catch (error) {
      if (error.message === 'Order already cancelled') {
        throw new RpcException({
          code: 9, // FAILED_PRECONDITION
          message: 'Order already cancelled'
        });
      }
      this.logger.error(`Failed to cancel order ${orderId}: ${error.message}`, error.stack);
      console.error('Error cancelling order:', error);
      throw new RpcException({
        code: 13,
        message: 'Failed to cancel order',
      });
    }
  }
}
