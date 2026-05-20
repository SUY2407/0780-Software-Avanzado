import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateOrderUseCase,
  CreateOrderFromCartUseCase,
  GetOrderUseCase,
  GetOrdersByUserUseCase,
  GetAllOrdersUseCase,
  UpdateOrderStatusUseCase,
} from '../../application/use-cases';
import { OrderResponseDto } from '../../application/dtos';

interface CreateOrderRequest {
  user_id: number;
  items: {
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

interface CreateOrderFromCartRequest {
  user_id: number;
}

interface GetOrderRequest {
  order_id: string;
}

interface GetOrdersByUserRequest {
  user_id: number;
}

interface UpdateOrderStatusRequest {
  order_id: string;
  status: string;
  payment_reference?: string;
}

interface GrpcOrderResponse {
  id: string;
  user_id: number;
  total: number;
  status: string;
  payment_reference: string;
  items: {
    id: string;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
  created_at: string;
  updated_at: string;
}

interface GrpcOrdersListResponse {
  orders: GrpcOrderResponse[];
}

@Controller()
export class OrdersGrpcController {
  private readonly logger = new Logger(OrdersGrpcController.name);

  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly createOrderFromCartUseCase: CreateOrderFromCartUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getOrdersByUserUseCase: GetOrdersByUserUseCase,
    private readonly getAllOrdersUseCase: GetAllOrdersUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  @GrpcMethod('OrdersService', 'CreateOrder')
  async createOrder(data: CreateOrderRequest): Promise<GrpcOrderResponse> {
    this.logger.log(`gRPC CreateOrder called for user ${data.user_id}`);

    const result = await this.createOrderUseCase.execute({
      userId: data.user_id,
      items: data.items.map((item) => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      })),
    });

    return this.mapToGrpcResponse(result);
  }

  @GrpcMethod('OrdersService', 'CreateOrderFromCart')
  async createOrderFromCart(
    data: CreateOrderFromCartRequest,
  ): Promise<GrpcOrderResponse> {
    this.logger.log(
      `gRPC CreateOrderFromCart called for user ${data.user_id}`,
    );

    const result = await this.createOrderFromCartUseCase.execute({
      userId: data.user_id,
    });

    return this.mapToGrpcResponse(result);
  }

  @GrpcMethod('OrdersService', 'GetOrder')
  async getOrder(data: GetOrderRequest): Promise<GrpcOrderResponse> {
    this.logger.log(`gRPC GetOrder called for order ${data.order_id}`);

    const result = await this.getOrderUseCase.execute(data.order_id);
    return this.mapToGrpcResponse(result);
  }

  @GrpcMethod('OrdersService', 'GetOrdersByUser')
  async getOrdersByUser(
    data: GetOrdersByUserRequest,
  ): Promise<GrpcOrdersListResponse> {
    this.logger.log(`gRPC GetOrdersByUser called for user ${data.user_id}`);

    const results = await this.getOrdersByUserUseCase.execute(data.user_id);
    return {
      orders: results.map((order) => this.mapToGrpcResponse(order)),
    };
  }

  @GrpcMethod('OrdersService', 'GetAllOrders')
  async getAllOrders(): Promise<GrpcOrdersListResponse> {
    this.logger.log('gRPC GetAllOrders called');

    const results = await this.getAllOrdersUseCase.execute();
    return {
      orders: results.map((order) => this.mapToGrpcResponse(order)),
    };
  }

  @GrpcMethod('OrdersService', 'UpdateOrderStatus')
  async updateOrderStatus(
    data: UpdateOrderStatusRequest,
  ): Promise<GrpcOrderResponse> {
    // Log the entire data object to debug
    this.logger.log(
      `gRPC UpdateOrderStatus called with raw data: ${JSON.stringify(data)}`,
    );

    // Handle both snake_case and camelCase field names
    // Note: gRPC typically converts snake_case to camelCase in TypeScript
    const orderId = (data as any).orderId || data.order_id;
    const status = data.status;
    const paymentReference = (data as any).paymentReference || data.payment_reference;

    this.logger.log(
      `gRPC UpdateOrderStatus called for order ${orderId} with status ${status}`,
    );

    if (!orderId) {
      this.logger.error(
        `Order ID is missing. Received data: ${JSON.stringify(data)}`,
      );
      throw new Error('Order ID is required');
    }

    const result = await this.updateOrderStatusUseCase.execute({
      orderId,
      status,
      paymentReference,
    });

    return this.mapToGrpcResponse(result);
  }

  private mapToGrpcResponse(order: OrderResponseDto): GrpcOrderResponse {
    return {
      id: order.id,
      user_id: order.userId,
      total: order.total,
      status: order.status,
      payment_reference: order.paymentReference || '',
      items: order.items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal,
      })),
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString(),
    };
  }
}
