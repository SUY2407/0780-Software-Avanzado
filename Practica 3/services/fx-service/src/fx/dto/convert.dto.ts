import { IsString, IsNotEmpty, IsNumber, IsPositive, Length, IsBoolean, Min } from 'class-validator';

export class ConvertRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Currency code must be 3 characters (e.g., USD, GTQ)' })
  from: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Currency code must be 3 characters (e.g., USD, GTQ)' })
  to: string;

  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  amount: number;
}

export class ConvertResponseDto {
  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsNumber()
  originalAmount: number;

  @IsNumber()
  convertedAmount: number;

  @IsNumber()
  rate: number;

  @IsBoolean()
  fromCache: boolean;
}
