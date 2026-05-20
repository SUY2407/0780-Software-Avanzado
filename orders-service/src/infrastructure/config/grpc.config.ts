import { registerAs } from '@nestjs/config';

export default registerAs('grpc', () => ({
  ordersService: {
    url: process.env.GRPC_URL || '0.0.0.0:50052',
  },
  cartService: {
    url: process.env.CART_SERVICE_URL || 'cart-service:50051',
  },
  catalogService: {
    url: process.env.CATALOG_SERVICE_URL || 'catalog-service:50051',
  },
}));
