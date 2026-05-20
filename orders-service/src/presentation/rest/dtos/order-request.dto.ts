import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemRequestDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty({ description: 'Product name', example: 'Laptop HP' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 999.99 })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateOrderRequestDto {
  @ApiProperty({
    description: 'Order items',
    type: [CreateOrderItemRequestDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemRequestDto)
  items: CreateOrderItemRequestDto[];
}

export class CreateOrderFromCartRequestDto {
  // No requiere campos, el userId se toma del usuario autenticado
}

export class UpdateOrderStatusRequestDto {
  @ApiProperty({
    description: 'New status',
    example: 'CONFIRMED',
    enum: ['PENDING', 'CONFIRMED'],
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({
    description: 'Payment reference',
    example: 'PAY-123456',
  })
  @IsOptional()
  @IsString()
  paymentReference?: string;
}

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  subtotal: number;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  paymentReference?: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
