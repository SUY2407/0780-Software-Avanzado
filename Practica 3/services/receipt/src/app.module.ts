import { Module } from '@nestjs/common';
import { ReceiptController } from './receipt/receipt.controller';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ReceiptController, AppController],
  providers: [],
})
export class AppModule {}
