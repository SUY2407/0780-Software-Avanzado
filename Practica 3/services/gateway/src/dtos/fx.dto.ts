export class GetExchangeRateDto {
  base: string;
  quote: string;
}

export class ConvertAmountDto {
  from: string;
  to: string;
  amount: number;
}
