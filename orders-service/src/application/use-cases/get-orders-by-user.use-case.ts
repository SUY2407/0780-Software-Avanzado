import { Inject, Injectable } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../domain/repositories/order.repository.interface';
import { OrderResponseDto } from '../dtos/order.dto';
import { OrderMapper } from './mappers/order.mapper';

@Injectable()
export class GetOrdersByUserUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(userId: number): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findByUserId(userId);
    return orders.map((order) => OrderMapper.toResponse(order));
  }
}
