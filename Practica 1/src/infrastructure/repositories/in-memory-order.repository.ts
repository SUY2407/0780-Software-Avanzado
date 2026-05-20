import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../interfaces/order.interface';

@Injectable()
export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, Order> = new Map();

  async save(order: Order): Promise<Order> {
    this.orders.set(order.orderId, order);
    return order;
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }

  async findAll(
    pageSize: number = 10,
    pageNumber: number = 1,
  ): Promise<{ orders: Order[]; totalCount: number }> {
    const allOrders = Array.from(this.orders.values());
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    const paginatedOrders = allOrders.slice(start, end);

    return {
      orders: paginatedOrders,
      totalCount: allOrders.length,
    };
  }

  async update(order: Order): Promise<Order> {
    this.orders.set(order.orderId, order);
    return order;
  }
}
