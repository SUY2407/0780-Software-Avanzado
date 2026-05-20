import { Controller, Get, Param, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface ReceiptService {
  GenerateReceipt(data: { order_id: string }): any;
}

@Controller('v1/receipts')
export class ReceiptController implements OnModuleInit {
  private receiptService: ReceiptService;

  constructor(
    @Inject('RECEIPT_PACKAGE') private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.receiptService = this.client.getService<ReceiptService>('ReceiptService');
  }

  @Get(':order_id')
  async getReceipt(@Param('order_id') order_id: string) {
    return firstValueFrom(
      this.receiptService.GenerateReceipt({ order_id })
    );
  }
}
