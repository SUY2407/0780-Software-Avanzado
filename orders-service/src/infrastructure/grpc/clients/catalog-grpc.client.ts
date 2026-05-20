import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientGrpc,
  Transport,
  ClientProxyFactory,
} from '@nestjs/microservices';
import { join } from 'path';
import { Observable, firstValueFrom, timeout, catchError, of } from 'rxjs';
import {
  ICatalogClient,
  UpdateProductResponse,
} from '../../../application/interfaces/catalog-client.interface';

interface UpdateProductRequest {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  providerId: number;
}

interface GenericResponse {
  message: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  providerId: number;
}

interface ProductIdRequest {
  id: number;
}

interface CatalogGrpcService {
  GetProduct(request: ProductIdRequest): Observable<Product>;
  UpdateProduct(request: UpdateProductRequest): Observable<GenericResponse>;
}

@Injectable()
export class CatalogGrpcClient implements ICatalogClient, OnModuleInit {
  private readonly logger = new Logger(CatalogGrpcClient.name);
  private catalogService: CatalogGrpcService;
  private grpcClient: ClientGrpc;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const catalogServiceUrl = this.configService.get<string>(
      'grpc.catalogService.url',
      'localhost:50051',
    );

    this.grpcClient = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'catalog',
        protoPath: join(__dirname, '../../../../proto/catalog.proto'),
        url: catalogServiceUrl,
      },
    }) as unknown as ClientGrpc;

    this.catalogService =
      this.grpcClient.getService<CatalogGrpcService>('CatalogService');
  }

  async updateProductStock(
    productId: number,
    quantity: number,
  ): Promise<UpdateProductResponse> {
    try {
      this.logger.log(
        `Updating stock for product ${productId} by quantity ${quantity}`,
      );

      // Primero obtenemos el producto actual para obtener su stock
      const product = await firstValueFrom(
        this.catalogService.GetProduct({ id: productId }).pipe(
          timeout(5000),
          catchError((error) => {
            this.logger.error(
              `Error fetching product ${productId}: ${error.message}`,
            );
            throw error;
          }),
        ),
      );

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      // Calculamos el nuevo stock (restamos la cantidad ordenada)
      const newStock = product.stock - quantity;

      if (newStock < 0) {
        throw new Error(
          `Insufficient stock for product ${productId}. Available: ${product.stock}, Requested: ${quantity}`,
        );
      }

      // Actualizamos el producto con el nuevo stock
      const response = await firstValueFrom(
        this.catalogService
          .UpdateProduct({
            id: product.id,
            sku: product.sku,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: newStock,
            category: product.category,
            imageUrl: product.imageUrl,
            providerId: product.providerId,
          })
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error(
                `Error updating product ${productId}: ${error.message}`,
              );
              throw error;
            }),
          ),
      );

      this.logger.log(
        `Successfully updated stock for product ${productId}. New stock: ${newStock}`,
      );

      return {
        message: response.message,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update stock for product ${productId}`,
        error,
      );
      throw error;
    }
  }
}
