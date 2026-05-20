import { Order } from '../../interfaces/order.interface';

export interface IOrderRepository {
  save(order: Order): Promise<Order>;
  findById(orderId: string): Promise<Order | null>;
  findAll(pageSize: number, pageNumber: number): Promise<{ orders: Order[]; totalCount: number }>;
  update(order: Order): Promise<Order>;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
