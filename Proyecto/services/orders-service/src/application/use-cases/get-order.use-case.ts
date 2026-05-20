import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../domain/repositories/order.repository.interface';
import { OrderResponseDto } from '../dtos/order.dto';
import { OrderMapper } from './mappers/order.mapper';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return OrderMapper.toResponse(order);
  }
}
