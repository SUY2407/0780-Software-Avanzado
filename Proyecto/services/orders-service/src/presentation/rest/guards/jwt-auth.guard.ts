import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

interface JwtPayload {
  user_id: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly jwtSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.get<string>('jwt.secret') || 'c3VwZXItc2VjcmV0LWp3dC1rZXk=';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('No token provided in request');
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;

      request.user = {
        userId: decoded.user_id,
        email: decoded.email,
        role: decoded.role,
      };

      this.logger.debug(`User authenticated: ${decoded.email}`);
      return true;
    } catch (error) {
      this.logger.error('Error validating token', error);
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
