import { Module } from '@nestjs/common';
import { FxController } from './fx.controller';
import { FxService } from './fx.service';
import { FrankfurterProvider } from './providers/frankfurter.provider';
import { ExchangeRateProvider } from './providers/exchangerate.provider';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [FxController],
  providers: [FxService, FrankfurterProvider, ExchangeRateProvider],
})
export class FxModule {}
