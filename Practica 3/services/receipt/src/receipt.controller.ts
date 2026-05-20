import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class ReceiptController {

  @GrpcMethod('ReceiptService', 'GenerateReceipt')
  generateReceipt(data: { order_id: string }) {
    // Generamos un recibo "dummy" pero funcional para el contrato
    return {
      order_id: data.order_id,
      generated_at: new Date().toISOString(),
      content_body: `Recibo oficial para la orden ${data.order_id}. Gracias por usar Quetzal Ship.`
    };
  }
}