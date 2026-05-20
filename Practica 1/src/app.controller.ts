import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('QuetzalShipService', 'CreateOrder')
  createOrder(data: any) {
    return this.appService.createOrder(data);
  }

  @GrpcMethod('QuetzalShipService', 'ListOrders')
  listOrders(data: any) {
    return this.appService.listOrders(data.pageSize, data.pageNumber);
  }

  @GrpcMethod('QuetzalShipService', 'GetOrder')
  getOrder(data: any) {
    return this.appService.getOrder(data.orderId);
  }

  @GrpcMethod('QuetzalShipService', 'CancelOrder')
  cancelOrder(data: any) {
    return this.appService.cancelOrder(data.orderId);
  }

  @GrpcMethod('QuetzalShipService', 'GetReceipt')
  getReceipt(data: any) {
    return this.appService.getReceipt(data.orderId);
  }
}