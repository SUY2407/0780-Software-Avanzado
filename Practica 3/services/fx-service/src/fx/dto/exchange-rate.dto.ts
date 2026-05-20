import { IsString, IsNotEmpty, Length, IsBoolean, IsNumber } from 'class-validator';

export class ExchangeRateRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Currency code must be 3 characters (e.g., USD, GTQ)' })
  base: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Currency code must be 3 characters (e.g., USD, GTQ)' })
  quote: string;
}

export class ExchangeRateResponseDto {
  @IsString()
  base: string;

  @IsString()
  quote: string;

  @IsNumber()
  rate: number;

  @IsString()
  timestamp: string;

  @IsBoolean()
  fromCache: boolean;

  @IsBoolean()
  isStale: boolean;
}
