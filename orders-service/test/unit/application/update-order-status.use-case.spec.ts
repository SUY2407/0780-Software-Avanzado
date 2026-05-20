import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateOrderStatusUseCase } from '../../../src/application/use-cases/update-order-status.use-case';
import { IOrderRepository } from '../../../src/domain/repositories/order.repository.interface';
import { Order } from '../../../src/domain/entities/order.entity';
import { OrderItem } from '../../../src/domain/entities/order-item.entity';
import { OrderStatus } from '../../../src/domain/value-objects/order-status.vo';
import { Money } from '../../../src/domain/value-objects/money.vo';

describe('UpdateOrderStatusUseCase', () => {
  let useCase: UpdateOrderStatusUseCase;
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

    useCase = new UpdateOrderStatusUseCase(mockOrderRepository);
  });

  const createOrder = (status: OrderStatus): Order => {
    return new Order({
      id: 'order-123',
      userId: 1,
      total: new Money(200),
      status,
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
  };

  describe('execute', () => {
    it('should update status successfully', async () => {
      const order = createOrder(OrderStatus.pending());
      const updatedOrder = createOrder(OrderStatus.confirmed());

      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(updatedOrder);

      const result = await useCase.execute({
        orderId: 'order-123',
        status: 'CONFIRMED',
      });

      expect(result.status).toBe('CONFIRMED');
      expect(mockOrderRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          orderId: 'non-existent',
          status: 'CONFIRMED',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const order = createOrder(OrderStatus.pending());
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        useCase.execute({
          orderId: 'order-123',
          status: 'DELIVERED',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid status value', async () => {
      const order = createOrder(OrderStatus.pending());
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        useCase.execute({
          orderId: 'order-123',
          status: 'INVALID_STATUS',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
