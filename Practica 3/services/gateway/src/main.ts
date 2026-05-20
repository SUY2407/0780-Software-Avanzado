import 'reflect-metadata'; // Asegúrate que esto esté arriba
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,             // <--- CAMBIA A FALSE (Deja pasar todo)
    forbidNonWhitelisted: false,  // <--- CAMBIA A FALSE (No lanza error por campos extra)
    transform: true,              // Mantiene la transformación de tipos
  }));

  await app.listen(3000);
  console.log('Gateway running on HTTP:3000 (Validation Relaxed)');
}
bootstrap();
