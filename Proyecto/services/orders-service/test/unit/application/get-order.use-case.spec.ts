import { NotFoundException } from '@nestjs/common';
import { GetOrderUseCase } from '../../../src/application/use-cases/get-order.use-case';
import { IOrderRepository } from '../../../src/domain/repositories/order.repository.interface';
import { Order } from '../../../src/domain/entities/order.entity';
import { OrderItem } from '../../../src/domain/entities/order-item.entity';
import { OrderStatus } from '../../../src/domain/value-objects/order-status.vo';
import { Money } from '../../../src/domain/value-objects/money.vo';

describe('GetOrderUseCase', () => {
  let useCase: GetOrderUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;

  beforeEach(() => {
    mockOrderRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetOrderUseCase(mockOrderRepository);
  });

  describe('execute', () => {
    it('should return order when found', async () => {
      const order = new Order({
        id: 'order-123',
        userId: 1,
        total: new Money(200),
        status: OrderStatus.pending(),
        items: [
          new OrderItem({
            id: 'item-1',
            productId: 1,
            productName: 'Test Product',
            quantity: 2,
            unitPrice: new Money(100),
          }),
        ],
      });

      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await useCase.execute('order-123');

      expect(result.id).toBe('order-123');
      expect(result.userId).toBe(1);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-123');
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
