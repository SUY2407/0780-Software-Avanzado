import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { OrdersController } from './orders.controller';
import { AppController } from './app.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRICING_PACKAGE', // Token para inyectar el cliente
        transport: Transport.GRPC,
        options: {
          package: 'pricing',
          protoPath: join(__dirname, '../../../contracts/proto/pricing.proto'),
          url: 'pricing:50052',
          loader: { keepCase: true }, // Apunta al contenedor 'pricing' en puerto 50052
        },
      },
    ]),
  ],
  controllers: [OrdersController, AppController],
  providers: [],
})
export class AppModule { }
