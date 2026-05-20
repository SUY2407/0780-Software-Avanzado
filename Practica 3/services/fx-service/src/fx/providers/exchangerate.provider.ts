import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { IExchangeRateProvider, ExchangeRateResult } from './provider.interface';

@Injectable()
export class ExchangeRateProvider implements IExchangeRateProvider {
  private readonly logger = new Logger(ExchangeRateProvider.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(private configService: ConfigService) {
    // Opción 1: Usar el operador ?? (nullish coalescing)
    this.baseUrl = this.configService.get('providers.exchangerate.url') ?? 'https://open.er-api.com/v6';
    this.timeout = this.configService.get('providers.exchangerate.timeout') ?? 5000;
    
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
    });
  }

  async getExchangeRate(base: string, quote: string): Promise<ExchangeRateResult> {
    try {
      this.logger.log(`Fetching rate from ExchangeRate-API: ${base} -> ${quote}`);
      
      const response = await this.httpClient.get(`/latest/${base}`);
      
      const rate = response.data.rates[quote];
      
      if (!rate) {
        throw new Error(`Rate not found for ${base}/${quote}`);
      }

      return {
        base,
        quote,
        rate,
        timestamp: new Date(response.data.time_last_update_unix * 1000).toISOString(),
      };
    } catch (error) {
      this.logger.error(`ExchangeRate-API provider failed: ${error.message}`);
      throw error;
    }
  }

  getName(): string {
    return 'ExchangeRate-API';
  }
}
