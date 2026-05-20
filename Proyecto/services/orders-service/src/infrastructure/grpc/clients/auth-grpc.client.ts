import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientGrpc, Client, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { firstValueFrom, Observable } from 'rxjs';
import {
  IAuthClient,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from '../../../application/interfaces/auth-client.interface';

interface AuthServiceGrpc {
  validateToken(
    request: ValidateTokenRequest,
  ): Observable<ValidateTokenResponse>;
}

@Injectable()
export class AuthGrpcClient implements IAuthClient, OnModuleInit {
  private readonly logger = new Logger(AuthGrpcClient.name);
  private authService: AuthServiceGrpc;

  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../../../../proto/auth.proto'),
      url: process.env.AUTH_SERVICE_URL || 'localhost:50052',
    },
  })
  private client: ClientGrpc;

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceGrpc>('AuthService');
    this.logger.log('Auth gRPC client initialized');
  }

  async validateToken(
    request: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    try {
      this.logger.debug(`Validating token via gRPC`);
      const response = await firstValueFrom(
        this.authService.validateToken(request),
      );
      return response;
    } catch (error) {
      this.logger.error('Error validating token', error);
      return {
        valid: false,
        userId: 0,
        email: '',
        role: '',
        error: 'Failed to validate token',
      };
    }
  }
}
