export interface CartProduct {
  productId: number;
  quantity: number;
  price: number;
  productName?: string;
}

export interface CartData {
  cartId: number;
  userId: number;
  status: string;
  createdAt: string;
  checkOut: boolean;
  total: number;
  updatedAt: string;
  products: CartProduct[];
}

export interface ICartClient {
  getCartByUserId(userId: number): Promise<CartData | null>;
  updatePaymentStatus(status: string): Promise<string>;
}

export const CART_CLIENT = Symbol('ICartClient');
