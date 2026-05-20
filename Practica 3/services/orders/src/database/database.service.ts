import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as sql from 'mssql';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: sql.ConnectionPool;
  private readonly logger = new Logger(DatabaseService.name);

  async onModuleInit() {
    const config: sql.config = {
      server: process.env.DB_HOST || 'mssql',
      port: parseInt(process.env.DB_PORT || '1433', 10),
      database: process.env.DB_NAME || 'QuetzalShipDB',
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
      options: {
        encrypt: false, // Para desarrollo local
        trustServerCertificate: true,
      },
    };

    try {
      this.pool = await new sql.ConnectionPool(config).connect();
      this.logger.log('Connected to MSSQL successfully');
    } catch (error) {
      this.logger.error('Failed to connect to MSSQL:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool?.close();
    this.logger.log('MSSQL connection closed');
  }

  getPool(): sql.ConnectionPool {
    return this.pool;
  }

  async query<T = any>(queryString: string, params?: any[]): Promise<T> {
    const request = this.pool.request();
    
    // Agregar parámetros si existen
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
    }

    const result = await request.query(queryString);
    return result.recordset as T;
  }
}
