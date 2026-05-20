export interface ExchangeRateResult {
  base: string;
  quote: string;
  rate: number;
  timestamp: string;
}

export interface IExchangeRateProvider {
  getExchangeRate(base: string, quote: string): Promise<ExchangeRateResult>;
  getName(): string;
}
