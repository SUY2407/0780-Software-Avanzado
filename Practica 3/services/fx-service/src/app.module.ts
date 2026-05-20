import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FxModule } from './fx/fx.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    FxModule,
  ],
})
export class AppModule {}
