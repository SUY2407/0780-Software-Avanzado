import { IsNumber, IsBoolean, IsArray, ValidateNested, IsOptional, IsEnum, Min } from 'class-validator';
import { Type, Expose } from 'class-transformer'; // IMPORTANTE: Agregué Expose

export class PackageDto {
  @IsNumber()
  @Min(0.01)
  @Expose() // Esto protege el campo
  weight_kg: number;

  @IsNumber()
  @Min(0.01)
  @Expose()
  height_cm: number;

  @IsNumber()
  @Min(0.01)
  @Expose()
  width_cm: number;

  @IsNumber()
  @Min(0.01)
  @Expose()
  length_cm: number;

  @IsBoolean()
  @Expose()
  fragile: boolean;

  @IsNumber()
  @Min(0)
  @Expose()
  declared_value_q: number;
}

export class DiscountDto {
  @IsEnum(['NONE', 'PERCENT', 'FIXED'])
  @Expose()
  type: string;

  @IsNumber()
  @Expose()
  value: number;
}

export class CreateOrderDto {
  @IsEnum(['METRO', 'INTERIOR', 'FRONTERA'])
  @Expose()
  origin_zone: string;

  @IsEnum(['METRO', 'INTERIOR', 'FRONTERA'])
  @Expose()
  destination_zone: string;

  @IsEnum(['STANDARD', 'EXPRESS', 'SAME_DAY'])
  @Expose()
  service_type: string;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageDto)
  @Expose()
  packages: PackageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountDto)
  @Expose()
  discount?: DiscountDto;

  @IsBoolean()
  @Expose()
  insurance_enabled: boolean;
}
