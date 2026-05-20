import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  username: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd123!',
  database: process.env.DB_DATABASE || 'OrdersDB',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
}));
