import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientGrpc,
  Client,
  Transport,
  ClientProxyFactory,
} from '@nestjs/microservices';
import { join } from 'path';
import { Observable, firstValueFrom, timeout, catchError, of } from 'rxjs';
import {
  ICartClient,
  CartData,
} from '../../../application/interfaces/cart-client.interface';

interface ObtenerCarroRequest {
  id_usuario: number;
}

interface ProductoCarro {
  id_producto: number;
  cantidad: number;
  precio: number;
}

interface ObtenerCarroResponse {
  id_carro: number;
  id_usuario: number;
  estado: string;
  created_at: string;
  check_out: boolean;
  total: number;
  updated_at: string;
  productos: ProductoCarro[];
}

interface ActualizarPagoRequest {
  estado: string;
}

interface ActualizarPagoResponse {
  estado: string;
}

interface CartGrpcService {
  ObtenerCarro(request: ObtenerCarroRequest): Observable<ObtenerCarroResponse>;
  ActualizarPago(
    request: ActualizarPagoRequest,
  ): Observable<ActualizarPagoResponse>;
}

@Injectable()
export class CartGrpcClient implements ICartClient, OnModuleInit {
  private readonly logger = new Logger(CartGrpcClient.name);
  private cartService: CartGrpcService;
  private grpcClient: ClientGrpc;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const cartServiceUrl = this.configService.get<string>(
      'CART_SERVICE_URL',
      'cart-service:50051',
    );

    this.grpcClient = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'carro',
        protoPath: join(__dirname, '../../../../proto/carrito.proto'),
        url: cartServiceUrl,
      },
    }) as unknown as ClientGrpc;

    this.cartService = this.grpcClient.getService<CartGrpcService>('Greet');
  }

  async getCartByUserId(userId: number): Promise<CartData | null> {
    try {
      this.logger.log(`Fetching cart for user ${userId}`);

      const response = await firstValueFrom(
        this.cartService.ObtenerCarro({ id_usuario: userId }).pipe(
          timeout(5000),
          catchError((error) => {
            this.logger.error(
              `Error fetching cart for user ${userId}: ${error.message}`,
            );
            return of(null);
          }),
        ),
      );

      if (!response) {
        return null;
      }

      return {
        cartId: response.id_carro,
        userId: response.id_usuario,
        status: response.estado,
        createdAt: response.created_at,
        checkOut: response.check_out,
        total: response.total,
        updatedAt: response.updated_at,
        products: (response.productos || []).map((p) => ({
          productId: p.id_producto,
          quantity: p.cantidad,
          price: p.precio,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get cart for user ${userId}`, error);
      return null;
    }
  }

  async updatePaymentStatus(status: string): Promise<string> {
    try {
      this.logger.log(`Updating payment status to: ${status}`);

      const response = await firstValueFrom(
        this.cartService.ActualizarPago({ estado: status }).pipe(
          timeout(5000),
          catchError((error) => {
            this.logger.error(
              `Error updating payment status: ${error.message}`,
            );
            return of({ estado: 'ERROR' });
          }),
        ),
      );

      return response.estado;
    } catch (error) {
      this.logger.error('Failed to update payment status', error);
      return 'ERROR';
    }
  }
}
