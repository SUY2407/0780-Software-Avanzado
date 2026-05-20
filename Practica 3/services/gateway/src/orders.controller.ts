import { Controller, Get, Post, Body, Param, Inject, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

// Definimos interfaces básicas para los servicios gRPC
interface OrdersService {
  CreateOrder(data: any): any;
  ListOrders(data: any): any;
  GetOrder(data: any): any;
  CancelOrder(data: any): any;
}

interface ReceiptService {
  GenerateReceipt(data: any): any;
}

@Controller('v1/orders')
export class OrdersController implements OnModuleInit {
  private ordersService: OrdersService;
  private receiptService: ReceiptService;

  constructor(
    @Inject('ORDERS_PACKAGE') private clientOrders: ClientGrpc,
    @Inject('RECEIPT_PACKAGE') private clientReceipt: ClientGrpc,
  ) {}

  onModuleInit() {
    this.ordersService = this.clientOrders.getService<OrdersService>('OrdersService');
    this.receiptService = this.clientReceipt.getService<ReceiptService>('ReceiptService');
  }

  @Post()
  // CAMBIO CLAVE: Usamos 'any' para evitar que el framework borre campos automáticamente
  async create(@Body() body: any) {
    // Log para confirmar que los datos llegan completos al controlador
    console.log('Gateway - Recibido RAW:', JSON.stringify(body, null, 2));

    try {
      // Enviamos el objeto directo. Al ser 'any', Nest no lo filtra.
      return await lastValueFrom(this.ordersService.CreateOrder(body));
    } catch (e) {
      console.error('Error en Gateway create:', e);
      throw new HttpException(e.details || 'Error creating order', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async list() {
    return await lastValueFrom(this.ordersService.ListOrders({}));
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    try {
      return await lastValueFrom(this.ordersService.GetOrder({ order_id: id }));
    } catch (e) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    try {
      return await lastValueFrom(this.ordersService.CancelOrder({ order_id: id }));
    } catch (e) {
        // Manejo de códigos de error gRPC (9 = FAILED_PRECONDITION)
        if (e.code === 9) {
            throw new HttpException('Order already cancelled', HttpStatus.CONFLICT);
        }
        throw new HttpException(e.details || 'Cannot cancel', HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id/receipt')
  async getReceipt(@Param('id') id: string) {
    return await lastValueFrom(this.receiptService.GenerateReceipt({ order_id: id }));
  }
}
