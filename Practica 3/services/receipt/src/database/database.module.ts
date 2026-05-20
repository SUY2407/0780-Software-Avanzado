import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Package } from './entities/package.entity';
import { OrderPricing } from './entities/order-pricing.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST || 'mssql-server',
      port: parseInt(process.env.DB_PORT || '1433', 10),
      username: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
      database: process.env.DB_NAME || 'QuetzalShipDB',
      entities: [Order, Package, OrderPricing],
      synchronize: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      logging: true,
    }),
    TypeOrmModule.forFeature([Order, Package, OrderPricing]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
