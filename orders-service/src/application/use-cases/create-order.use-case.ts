import { Inject, Injectable, Logger } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderStatus } from '../../domain/value-objects/order-status.vo';
import { Money } from '../../domain/value-objects/money.vo';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../domain/repositories/order.repository.interface';
import {
  ICatalogClient,
  CATALOG_CLIENT,
} from '../interfaces/catalog-client.interface';
import { CreateOrderDto, OrderResponseDto } from '../dtos/order.dto';
import { OrderMapper } from './mappers/order.mapper';

@Injectable()
export class CreateOrderUseCase {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(CATALOG_CLIENT)
    private readonly catalogClient: ICatalogClient,
  ) {}

  async execute(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const orderItems = dto.items.map(
      (item) =>
        new OrderItem({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: new Money(item.unitPrice),
        }),
    );

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.subtotal.amount,
      0,
    );

    const order = new Order({
      userId: dto.userId,
      total: new Money(totalAmount),
      status: OrderStatus.pending(),
      items: orderItems,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Actualizar el stock de los productos en el catálogo
    try {
      for (const item of orderItems) {
        await this.catalogClient.updateProductStock(
          item.productId,
          item.quantity,
        );
        this.logger.log(
          `Stock updated for product ${item.productId}, quantity: ${item.quantity}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to update product stock in catalog', error);
      // Podrías implementar lógica de rollback aquí si es necesario
    }

    return OrderMapper.toResponse(savedOrder);
  }
}
