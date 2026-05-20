import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { OrdersController } from './orders.controller';
import { AppController } from './app.controller';
import { FxController } from './fx.controller';
import { ReceiptController } from './receipt.controller'; // NUEVO

@Module({
  imports: [
    ClientsModule.register([
      // Cliente para ORDERS (Puerto 50051)
      {
        name: 'ORDERS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'orders',
          protoPath: join(__dirname, '../../../contracts/proto/orders.proto'),
          url: 'orders:50051',
          loader: { keepCase: true },
        },
      },
      {
        name: 'RECEIPT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'receipt',
          protoPath: join(__dirname, '../../../contracts/proto/receipt.proto'),
          url: 'receipt:50053',
          loader: { keepCase: true },
        },
      },
      // Cliente para FX (Puerto 50054)
      {
        name: 'FX_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'fx',
          protoPath: join(__dirname, '../../../contracts/proto/fx.proto'),
          url: 'fx-service:50054',
          loader: { keepCase: true },
        },
      },
    ]),
  ],
  controllers: [
    OrdersController,
    AppController,
    FxController,
    ReceiptController, // AGREGAR AQUÍ
  ],
  providers: [],
})
export class AppModule {}
