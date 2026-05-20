import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from '../../application/services/order.service';

/**
 * Controlador gRPC - Capa de Presentación
 * Principio SRP: Solo se encarga de recibir requests gRPC y delegar al servicio de aplicación
 * No contiene lógica de negocio
 */
@Controller()
export class OrderGrpcController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod('QuetzalShipService', 'CreateOrder')
  async createOrder(data: any) {
    // Mapear datos del request gRPC al DTO de aplicación
    const result = await this.orderService.createOrder({
      originZone: data.originZone,
      destinationZone: data.destinationZone,
      serviceType: data.serviceType,
      packages: data.packages,
      discount: data.discount,
      insuranceEnabled: data.insuranceEnabled,
    });

    // Retornar respuesta (gRPC lo serializa automáticamente)
    return result;
  }

  @GrpcMethod('QuetzalShipService', 'ListOrders')
  async listOrders(data: any) {
    const result = await this.orderService.listOrders(
      data.pageSize || 10,
      data.pageNumber || 1,
    );

    // Mapear a formato de respuesta gRPC
    return {
      orders: result.orders.map((order) => ({
        orderId: order.orderId,
        destinationZone: order.destinationZone,
        serviceType: order.serviceType,
        status: order.status,
        totalCents: order.totalCents,
      })),
      totalCount: result.totalCount,
    };
  }

  @GrpcMethod('QuetzalShipService', 'GetOrder')
  async getOrder(data: any) {
    return await this.orderService.getOrder(data.orderId);
  }

  @GrpcMethod('QuetzalShipService', 'CancelOrder')
  async cancelOrder(data: any) {
    return await this.orderService.cancelOrder(data.orderId);
  }

  @GrpcMethod('QuetzalShipService', 'GetReceipt')
  async getReceipt(data: any) {
    const order = await this.orderService.getReceipt(data.orderId);

    // Mapear a formato de recibo
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
}
