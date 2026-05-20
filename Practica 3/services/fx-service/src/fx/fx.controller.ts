import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FxService } from './fx.service';

interface ExchangeRateRequest {
  base: string;
  quote: string;
}

interface ConvertRequest {
  from: string;
  to: string;
  amount: number;
}

@Controller()
export class FxController {
  private readonly logger = new Logger(FxController.name);

  constructor(private readonly fxService: FxService) {}

  @GrpcMethod('FxService', 'GetExchangeRate')
  async getExchangeRate(data: ExchangeRateRequest) {
    this.logger.log(`gRPC call: GetExchangeRate(${data.base}/${data.quote})`);
    
    try {
      const result = await this.fxService.getExchangeRate(data.base, data.quote);
      
      return {
        base: result.base,
        quote: result.quote,
        rate: result.rate,
        timestamp: result.timestamp,
        fromCache: result.fromCache,
        isStale: result.isStale || false,
      };
    } catch (error) {
      this.logger.error(`Error in GetExchangeRate: ${error.message}`);
      throw error;
    }
  }

  @GrpcMethod('FxService', 'ConvertAmount')
  async convertAmount(data: ConvertRequest) {
    this.logger.log(`gRPC call: ConvertAmount(${data.amount} ${data.from} -> ${data.to})`);
    
    try {
      const result = await this.fxService.convertAmount(
        data.from,
        data.to,
        data.amount,
      );
      
      return result;
    } catch (error) {
      this.logger.error(`Error in ConvertAmount: ${error.message}`);
      throw error;
    }
  }
}
