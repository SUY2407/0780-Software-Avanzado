import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../../domain/entities/order.entity';
import { OrderItem } from '../../../domain/entities/order-item.entity';
import { OrderStatus } from '../../../domain/value-objects/order-status.vo';
import { Money } from '../../../domain/value-objects/money.vo';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  async save(order: Order): Promise<Order> {
    const orderEntity = this.toEntity(order);
    const savedEntity = await this.orderRepository.save(orderEntity);
    return this.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Order | null> {
    const entity = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
  }

  async findByUserId(userId: number): Promise<Order[]> {
    const entities = await this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findAll(): Promise<Order[]> {
    const entities = await this.orderRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async update(order: Order): Promise<Order> {
    const orderEntity = this.toEntity(order);
    orderEntity.id = order.id!;

    const savedEntity = await this.orderRepository.save(orderEntity);
    return this.toDomain(savedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }

  private toEntity(order: Order): OrderEntity {
    const entity = new OrderEntity();
    if (order.id) {
      entity.id = order.id;
    }
    entity.userId = order.userId;
    entity.total = order.total.amount;
    entity.status = order.status.value;
    entity.paymentReference = order.paymentReference || null;
    entity.createdAt = order.createdAt;
    entity.updatedAt = order.updatedAt;

    entity.items = order.items.map((item) => {
      const itemEntity = new OrderItemEntity();
      if (item.id) {
        itemEntity.id = item.id;
      }
      itemEntity.productId = item.productId;
      itemEntity.productName = item.productName;
      itemEntity.quantity = item.quantity;
      itemEntity.unitPrice = item.unitPrice.amount;
      itemEntity.subtotal = item.subtotal.amount;
      return itemEntity;
    });

    return entity;
  }

  private toDomain(entity: OrderEntity): Order {
    const items = (entity.items || []).map(
      (itemEntity) =>
        new OrderItem({
          id: itemEntity.id,
          orderId: itemEntity.orderId,
          productId: itemEntity.productId,
          productName: itemEntity.productName,
          quantity: itemEntity.quantity,
          unitPrice: new Money(Number(itemEntity.unitPrice)),
          subtotal: new Money(Number(itemEntity.subtotal)),
        }),
    );

    return new Order({
      id: entity.id,
      userId: entity.userId,
      total: new Money(Number(entity.total)),
      status: OrderStatus.fromString(entity.status),
      paymentReference: entity.paymentReference || undefined,
      items,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
