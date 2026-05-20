import { Module } from '@nestjs/common';
import { PricingController } from './pricing.controller';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [PricingController, AppController],
  providers: [],
})
export class AppModule {}
