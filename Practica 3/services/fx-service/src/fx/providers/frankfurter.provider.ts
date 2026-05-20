import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { IExchangeRateProvider, ExchangeRateResult } from './provider.interface';

@Injectable()
export class FrankfurterProvider implements IExchangeRateProvider {
  private readonly logger = new Logger(FrankfurterProvider.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get('providers.frankfurter.url') ?? 'https://api.frankfurter.app';
    this.timeout = this.configService.get('providers.frankfurter.timeout') ?? 5000;
    
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
    });
  }

  async getExchangeRate(base: string, quote: string): Promise<ExchangeRateResult> {
    try {
      this.logger.log(`Fetching rate from Frankfurter: ${base} -> ${quote}`);
      
      const response = await this.httpClient.get('/latest', {
        params: {
          from: base,
          to: quote,
        },
      });

      const rate = response.data.rates[quote];
      
      if (!rate) {
        throw new Error(`Rate not found for ${base}/${quote}`);
      }

      return {
        base,
        quote,
        rate,
        timestamp: response.data.date || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Frankfurter provider failed: ${error.message}`);
      throw error;
    }
  }

  getName(): string {
    return 'Frankfurter';
  }
}
