import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // 1. App HTTP base (para health check)
  const app = await NestFactory.create(AppModule);

  // 2. Configurar microservicio gRPC
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'orders',
    protoPath: join(__dirname, '../../../contracts/proto/orders.proto'),
    url: '0.0.0.0:50051',
    loader: { keepCase: true },// Puerto de escucha gRPC
    },
  });

  // 3. Iniciar todo
  await app.startAllMicroservices();
  await app.listen(3000); // Puerto HTTP interno para health check
  console.log('Orders Service running on gRPC:50051 & HTTP:3000');
}
bootstrap();
