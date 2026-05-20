import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('OrdersService');

  // Create HTTP application
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Orders Service API')
    .setDescription('EconoMarket Orders Microservice API')
    .setVersion('1.0')
    .addTag('orders')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Connect gRPC microservice
  const grpcUrl = configService.get<string>('grpc.ordersService.url', '0.0.0.0:50052');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'orders',
      protoPath: join(__dirname, '../proto/orders.proto'),
      url: grpcUrl,
    },
  });

  // Start all microservices
  await app.startAllMicroservices();
  logger.log(`gRPC server running on ${grpcUrl}`);

  // Start HTTP server
  const httpPort = configService.get<number>('HTTP_PORT', 8084);
  await app.listen(httpPort);
  logger.log(`HTTP server running on port ${httpPort}`);
  logger.log(`Swagger docs available at http://localhost:${httpPort}/api/docs`);
}

bootstrap();
