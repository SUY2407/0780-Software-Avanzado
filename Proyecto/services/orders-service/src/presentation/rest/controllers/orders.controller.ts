import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateOrderUseCase,
  CreateOrderFromCartUseCase,
  GetOrderUseCase,
  GetOrdersByUserUseCase,
  GetAllOrdersUseCase,
  UpdateOrderStatusUseCase,
} from '../../../application/use-cases';
import {
  CreateOrderRequestDto,
  CreateOrderFromCartRequestDto,
  UpdateOrderStatusRequestDto,
  OrderResponseDto,
} from '../dtos/order-request.dto';
import { JwtAuthGuard, RolesGuard } from '../guards';
import { CurrentUser, Roles } from '../decorators';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly createOrderFromCartUseCase: CreateOrderFromCartUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getOrdersByUserUseCase: GetOrdersByUserUseCase,
    private readonly getAllOrdersUseCase: GetAllOrdersUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createOrder(
    @Body() dto: CreateOrderRequestDto,
    @CurrentUser() user: { userId: number; email: string; role: string },
  ): Promise<OrderResponseDto> {
    return this.createOrderUseCase.execute({
      userId: user.userId,
      items: dto.items,
    });
  }

  @Post('from-cart')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create order from user cart' })
  @ApiResponse({
    status: 201,
    description: 'Order created from cart successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found or empty' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createOrderFromCart(
    @CurrentUser() user: { userId: number; email: string; role: string },
  ): Promise<OrderResponseDto> {
    return this.createOrderFromCartUseCase.execute({
      userId: user.userId,
    });
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all orders',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getAllOrders(): Promise<OrderResponseDto[]> {
    return this.getAllOrdersUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order found',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrder(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderResponseDto> {
    return this.getOrderUseCase.execute(id);
  }

  @Get('user/me')
  @ApiOperation({ summary: 'Get orders for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyOrders(
    @CurrentUser() user: { userId: number; email: string; role: string },
  ): Promise<OrderResponseDto[]> {
    return this.getOrdersByUserUseCase.execute(user.userId);
  }

  @Get('user/:userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Get orders by user ID (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getOrdersByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<OrderResponseDto[]> {
    return this.getOrdersByUserUseCase.execute(userId);
  }

  @Put(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusRequestDto,
  ): Promise<OrderResponseDto> {
    return this.updateOrderStatusUseCase.execute({
      orderId: id,
      status: dto.status,
      paymentReference: dto.paymentReference,
    });
  }
}
