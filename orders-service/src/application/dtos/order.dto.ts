export interface CreateOrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderDto {
  userId: number;
  items: CreateOrderItemDto[];
}

export interface UpdateOrderStatusDto {
  orderId: string;
  status: string;
  paymentReference?: string;
}

export interface OrderItemResponseDto {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponseDto {
  id: string;
  userId: number;
  total: number;
  status: string;
  paymentReference?: string;
  items: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderFromCartDto {
  userId: number;
}
