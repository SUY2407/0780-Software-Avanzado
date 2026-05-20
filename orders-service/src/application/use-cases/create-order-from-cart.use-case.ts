import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderStatus } from '../../domain/value-objects/order-status.vo';
import { Money } from '../../domain/value-objects/money.vo';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../domain/repositories/order.repository.interface';
import {
  ICartClient,
  CART_CLIENT,
} from '../interfaces/cart-client.interface';
import {
  ICatalogClient,
  CATALOG_CLIENT,
} from '../interfaces/catalog-client.interface';
import { CreateOrderFromCartDto, OrderResponseDto } from '../dtos/order.dto';
import { OrderMapper } from './mappers/order.mapper';

@Injectable()
export class CreateOrderFromCartUseCase {
  private readonly logger = new Logger(CreateOrderFromCartUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(CART_CLIENT)
    private readonly cartClient: ICartClient,
    @Inject(CATALOG_CLIENT)
    private readonly catalogClient: ICatalogClient,
  ) {}

  async execute(dto: CreateOrderFromCartDto): Promise<OrderResponseDto> {
    const cart = await this.cartClient.getCartByUserId(dto.userId);

    if (!cart || cart.products.length === 0) {
      throw new NotFoundException(
        `Cart not found or empty for user ${dto.userId}`,
      );
    }

    const orderItems = cart.products.map(
      (product) =>
        new OrderItem({
          productId: product.productId,
          productName: product.productName || `Product ${product.productId}`,
          quantity: product.quantity,
          unitPrice: new Money(product.price),
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
