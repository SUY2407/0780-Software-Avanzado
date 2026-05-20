import { CreateOrderUseCase } from '../../../src/application/use-cases/create-order.use-case';
import { IOrderRepository } from '../../../src/domain/repositories/order.repository.interface';
import { ICatalogClient } from '../../../src/application/interfaces/catalog-client.interface';
import { Order } from '../../../src/domain/entities/order.entity';
import { OrderItem } from '../../../src/domain/entities/order-item.entity';
import { OrderStatus } from '../../../src/domain/value-objects/order-status.vo';
import { Money } from '../../../src/domain/value-objects/money.vo';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockCatalogClient: jest.Mocked<ICatalogClient>;

  beforeEach(() => {
    mockOrderRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockCatalogClient = {
      updateProductStock: jest.fn().mockResolvedValue({ message: 'Stock updated' }),
    };

    useCase = new CreateOrderUseCase(mockOrderRepository, mockCatalogClient);
  });

  describe('execute', () => {
    it('should create an order successfully', async () => {
      const dto = {
        userId: 1,
        items: [
          {
            productId: 1,
            productName: 'Test Product',
            quantity: 2,
            unitPrice: 100,
          },
        ],
      };

      const savedOrder = new Order({
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockOrderRepository.save.mockResolvedValue(savedOrder);

      const result = await useCase.execute(dto);

      expect(result.id).toBe('order-123');
      expect(result.userId).toBe(1);
      expect(result.total).toBe(200);
      expect(result.status).toBe('PENDING');
      expect(result.items).toHaveLength(1);
      expect(mockOrderRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should calculate total from items', async () => {
      const dto = {
        userId: 1,
        items: [
          {
            productId: 1,
            productName: 'Product 1',
            quantity: 2,
            unitPrice: 100,
          },
          {
            productId: 2,
            productName: 'Product 2',
            quantity: 3,
            unitPrice: 50,
          },
        ],
      };

      const savedOrder = new Order({
        id: 'order-123',
        userId: 1,
        total: new Money(350),
        status: OrderStatus.pending(),
        items: [
          new OrderItem({
            productId: 1,
            productName: 'Product 1',
            quantity: 2,
            unitPrice: new Money(100),
          }),
          new OrderItem({
            productId: 2,
            productName: 'Product 2',
            quantity: 3,
            unitPrice: new Money(50),
          }),
        ],
      });

      mockOrderRepository.save.mockResolvedValue(savedOrder);

      const result = await useCase.execute(dto);

      expect(result.total).toBe(350);
    });

    it('should include payment reference when provided', async () => {
      const dto = {
        userId: 1,
        items: [
          {
            productId: 1,
            productName: 'Test Product',
            quantity: 1,
            unitPrice: 100,
          },
        ],
        paymentReference: 'PAY-123',
      };

      const savedOrder = new Order({
        id: 'order-123',
        userId: 1,
        total: new Money(100),
        status: OrderStatus.pending(),
        paymentReference: 'PAY-123',
        items: [
          new OrderItem({
            productId: 1,
            productName: 'Test Product',
            quantity: 1,
            unitPrice: new Money(100),
          }),
        ],
      });

      mockOrderRepository.save.mockResolvedValue(savedOrder);

      const result = await useCase.execute(dto);

      expect(result.paymentReference).toBe('PAY-123');
    });
  });
});
