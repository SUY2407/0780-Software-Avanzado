import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    DatabaseModule, // NUEVO: Módulo de base de datos
    ClientsModule.register([
      {
        name: 'PRICING_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'pricing',
          protoPath: join(__dirname, '../../../contracts/proto/pricing.proto'),
          url: 'pricing:50052',
          loader: { keepCase: true },
        },
      },
    ]),
  ],
  controllers: [OrdersController, AppController],
  providers: [OrdersService], // NUEVO: Servicio de Orders
})
export class AppModule {}
