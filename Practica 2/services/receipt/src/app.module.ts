import { Module } from '@nestjs/common';
import { ReceiptController } from './receipt.controller';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [ReceiptController, AppController],
  providers: [],
})
export class AppModule {}