import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'receipt',
      protoPath: join(__dirname, '../../../contracts/proto/receipt.proto'),
      url: '0.0.0.0:50053',
      loader: { keepCase: true }, // PUERTO 50053
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000); // Health Check
  console.log('Receipt Service running on gRPC:50053 & HTTP:3000');
}
bootstrap();