import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../domain/repositories/order.repository.interface';
import { OrderStatus } from '../../domain/value-objects/order-status.vo';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { UpdateOrderStatusDto, OrderResponseDto } from '../dtos/order.dto';
import { OrderMapper } from './mappers/order.mapper';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(dto.orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    try {
      const newStatus = OrderStatus.fromString(dto.status);
      order.updateStatus(newStatus);

      if (dto.paymentReference) {
        order.setPaymentReference(dto.paymentReference);
      }
    } catch (error) {
      if (error instanceof DomainException) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(`Invalid status: ${dto.status}`);
    }

    const updatedOrder = await this.orderRepository.update(order);
    return OrderMapper.toResponse(updatedOrder);
  }
}
