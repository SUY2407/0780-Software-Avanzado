import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { OrdersController } from './orders.controller';
import { AppController } from './app.controller';

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
          loader: { keepCase: true }, // <--- AGREGA ESTO
        },
      },
      {
        name: 'RECEIPT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'receipt',
          protoPath: join(__dirname, '../../../contracts/proto/receipt.proto'),
          url: 'receipt:50053',
          loader: { keepCase: true }, // <--- AGREGA ESTO
        },
      },
    ]),
  ],
  controllers: [OrdersController, AppController],
  providers: [],
})
export class AppModule { }
