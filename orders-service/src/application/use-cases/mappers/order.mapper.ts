import { Order } from '../../../domain/entities/order.entity';
import { OrderResponseDto, OrderItemResponseDto } from '../../dtos/order.dto';

export class OrderMapper {
  static toResponse(order: Order): OrderResponseDto {
    const items: OrderItemResponseDto[] = order.items.map((item) => ({
      id: item.id || '',
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.amount,
      subtotal: item.subtotal.amount,
    }));

    return {
      id: order.id || '',
      userId: order.userId,
      total: order.total.amount,
      status: order.status.value,
      paymentReference: order.paymentReference,
      items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
