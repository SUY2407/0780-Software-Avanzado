import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

// Interfaz para el cliente Pricing (Define qué métodos tiene)
interface PricingService {
  CalculatePrice(data: any): Observable<any>;
}

@Controller()
export class OrdersController implements OnModuleInit {
  private pricingService: PricingService;
  
  // Base de datos en memoria (se borra al reiniciar)
  private orders: any[] = []; 

  constructor(@Inject('PRICING_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    // Instanciar el servicio remoto
    this.pricingService = this.client.getService<PricingService>('PricingService');
  }

  @GrpcMethod('OrdersService', 'CreateOrder')
  async createOrder(data: any) {
    console.log('OrdersService: Creating order...');

    try {
      // 1. Llamar síncronamente a Pricing (gRPC)
      const priceResponse = await lastValueFrom(
        this.pricingService.CalculatePrice({
          origin_zone: data.origin_zone,
          destination_zone: data.destination_zone,
          service_type: data.service_type,
          packages: data.packages,
          insurance_enabled: data.insurance_enabled,
          discount: data.discount
        })
      );

      // 2. Construir la orden
      const newOrder = {
        order_id: uuidv4(),
        created_at: new Date().toISOString(),
        status: 'ACTIVE',
        origin_zone: data.origin_zone,
        destination_zone: data.destination_zone,
        service_type: data.service_type,
        packages: data.packages,
        discount: data.discount,
        insurance_enabled: data.insurance_enabled,
        // Datos calculados por Pricing
        total: priceResponse.total,
        breakdown: priceResponse.breakdown
      };

      // 3. Guardar
      this.orders.push(newOrder);
      console.log(`Order created: ${newOrder.order_id}`);
      
      return newOrder;

    } catch (error) {
      console.error('Error creating order:', error);
      // Retornar error gRPC estándar si falla Pricing
      throw new RpcException({
        code: 13, // INTERNAL
        message: 'Failed to calculate price with Pricing Service'
      });
    }
  }

  @GrpcMethod('OrdersService', 'ListOrders')
  listOrders() {
    return { orders: this.orders };
  }

  @GrpcMethod('OrdersService', 'GetOrder')
  getOrder(data: { order_id: string }) {
    const order = this.orders.find(o => o.order_id === data.order_id);
    if (!order) {
        throw new RpcException({ code: 5, message: 'Order not found' }); // 5 = NOT_FOUND
    }
    return order;
  }
  
  @GrpcMethod('OrdersService', 'CancelOrder')
  cancelOrder(data: { order_id: string }) {
     const orderIndex = this.orders.findIndex(o => o.order_id === data.order_id);
     if (orderIndex === -1) {
        throw new RpcException({ code: 5, message: 'Order not found' });
     }
     
     const order = this.orders[orderIndex];
     if (order.status === 'CANCELLED') {
         throw new RpcException({ code: 9, message: 'Order already cancelled' }); // 9 = FAILED_PRECONDITION
     }
     
     // Actualizar estado (Congelamiento: no se borra, solo cambia estado)
     this.orders[orderIndex].status = 'CANCELLED';
     return this.orders[orderIndex];
  }
}
