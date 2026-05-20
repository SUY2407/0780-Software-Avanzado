import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'pricing',
      protoPath: join(__dirname, '../../../contracts/proto/pricing.proto'),
      url: '0.0.0.0:50052',
      loader: { keepCase: true }, // PUERTO 50052
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000); // Health check
  console.log('Pricing Service running on gRPC:50052 & HTTP:3000');
}
bootstrap();
