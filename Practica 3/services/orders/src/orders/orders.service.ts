import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';
import * as sql from 'mssql';

export interface Package {
  weight_kg: number;
  height_cm?: number;
  width_cm?: number;
  length_cm?: number;
  fragile?: boolean;
  declared_value_q?: number;
}

export interface PriceBreakdown {
  base_subtotal: number;
  service_subtotal: number;
  fragile_surcharge: number;
  insurance_surcharge: number;
  subtotal_with_surcharges: number;
  discount_amount: number;
  total: number;
}

export interface CreateOrderData {
  origin_zone: string;
  destination_zone: string;
  service_type: string;
  packages: Package[];
  discount?: any;
  insurance_enabled?: boolean;
  breakdown: PriceBreakdown;
  total: number;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly dbService: DatabaseService) {}

  /**
   * Crear orden y persistir en MSSQL
   */
  async createOrder(data: CreateOrderData): Promise<any> {
    const pool = this.dbService.getPool();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const orderId = uuidv4();
      const now = new Date();

      // 1. Insertar orden
      await transaction.request()
        .input('order_id', sql.UniqueIdentifier, orderId)
        .input('origin', sql.VarChar(50), data.origin_zone)
        .input('destination', sql.VarChar(50), data.destination_zone)
        .input('service_type', sql.VarChar(50), data.service_type)
        .input('status', sql.VarChar(50), 'ACTIVE')
        .input('created_at', sql.DateTime2, now)
        .input('updated_at', sql.DateTime2, now)
        .query(`
          INSERT INTO orders (order_id, origin, destination, service_type, status, created_at, updated_at)
          VALUES (@order_id, @origin, @destination, @service_type, @status, @created_at, @updated_at)
        `);

      // 2. Insertar paquetes
      for (const pkg of data.packages) {
        await transaction.request()
          .input('order_id', sql.UniqueIdentifier, orderId)
          .input('weight_kg', sql.Decimal(10, 2), pkg.weight_kg)
          .input('description', sql.NVarChar(255), this.buildPackageDescription(pkg))
          .input('created_at', sql.DateTime2, now)
          .query(`
            INSERT INTO packages (order_id, weight_kg, description, created_at)
            VALUES (@order_id, @weight_kg, @description, @created_at)
          `);
      }

      // 3. Insertar pricing (desglose)
      const totalWeight = data.packages.reduce((sum, pkg) => sum + pkg.weight_kg, 0);
      
      await transaction.request()
        .input('order_id', sql.UniqueIdentifier, orderId)
        .input('total_weight_kg', sql.Decimal(10, 2), totalWeight)
        .input('base_price', sql.Decimal(10, 2), data.breakdown.base_subtotal)
        .input('zone_surcharge', sql.Decimal(10, 2), 0) // Ajustar según tu lógica
        .input('service_surcharge', sql.Decimal(10, 2), data.breakdown.service_subtotal - data.breakdown.base_subtotal)
        .input('discount_percentage', sql.Decimal(5, 2), 0) // Calcular del discount si existe
        .input('discount_amount', sql.Decimal(10, 2), data.breakdown.discount_amount)
        .input('subtotal', sql.Decimal(10, 2), data.breakdown.subtotal_with_surcharges)
        .input('total', sql.Decimal(10, 2), data.breakdown.total)
        .input('currency', sql.VarChar(3), 'GTQ')
        .input('calculated_at', sql.DateTime2, now)
        .query(`
          INSERT INTO order_pricing (
            order_id, total_weight_kg, base_price, zone_surcharge, service_surcharge,
            discount_percentage, discount_amount, subtotal, total, currency, calculated_at
          )
          VALUES (
            @order_id, @total_weight_kg, @base_price, @zone_surcharge, @service_surcharge,
            @discount_percentage, @discount_amount, @subtotal, @total, @currency, @calculated_at
          )
        `);

      await transaction.commit();

      this.logger.log(`Order ${orderId} created and persisted successfully`);

      // Retornar la orden completa
      return {
        order_id: orderId,
        created_at: now.toISOString(),
        status: 'ACTIVE',
        origin_zone: data.origin_zone,
        destination_zone: data.destination_zone,
        service_type: data.service_type,
        packages: data.packages,
        discount: data.discount,
        insurance_enabled: data.insurance_enabled,
        breakdown: data.breakdown,
        total: data.total,
      };

    } catch (error) {
      await transaction.rollback();
      this.logger.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Obtener orden por ID
   */
  async getOrder(orderId: string): Promise<any> {
    const pool = this.dbService.getPool();

    // 1. Obtener orden
    const orderResult = await pool.request()
      .input('order_id', sql.UniqueIdentifier, orderId)
      .query(`
        SELECT * FROM orders WHERE order_id = @order_id
      `);

    if (orderResult.recordset.length === 0) {
      return null;
    }

    const order = orderResult.recordset[0];

    // 2. Obtener paquetes
    const packagesResult = await pool.request()
      .input('order_id', sql.UniqueIdentifier, orderId)
      .query(`
        SELECT * FROM packages WHERE order_id = @order_id
      `);

    // 3. Obtener pricing
    const pricingResult = await pool.request()
      .input('order_id', sql.UniqueIdentifier, orderId)
      .query(`
        SELECT * FROM order_pricing WHERE order_id = @order_id
      `);

    const pricing = pricingResult.recordset[0];

    return {
      order_id: order.order_id,
      created_at: order.created_at,
      status: order.status,
      origin_zone: order.origin,
      destination_zone: order.destination,
      service_type: order.service_type,
      packages: packagesResult.recordset.map(pkg => ({
        weight_kg: pkg.weight_kg,
        description: pkg.description,
      })),
      breakdown: pricing ? {
        base_subtotal: pricing.base_price,
        service_subtotal: pricing.base_price + pricing.service_surcharge,
        fragile_surcharge: 0,
        insurance_surcharge: 0,
        subtotal_with_surcharges: pricing.subtotal,
        discount_amount: pricing.discount_amount,
        total: pricing.total,
      } : null,
      total: pricing?.total || 0,
    };
  }

  /**
   * Listar todas las órdenes
   */
  async listOrders(): Promise<any[]> {
    const pool = this.dbService.getPool();

    const result = await pool.request().query(`
      SELECT 
        o.*,
        p.total,
        p.currency
      FROM orders o
      LEFT JOIN order_pricing p ON o.order_id = p.order_id
      ORDER BY o.created_at DESC
    `);

    return result.recordset.map(row => ({
      order_id: row.order_id,
      created_at: row.created_at,
      status: row.status,
      origin_zone: row.origin,
      destination_zone: row.destination,
      service_type: row.service_type,
      total: row.total,
      currency: row.currency,
    }));
  }

  /**
   * Cancelar orden
   */
  async cancelOrder(orderId: string): Promise<any> {
    const pool = this.dbService.getPool();

    // Verificar que exista y no esté cancelada
    const checkResult = await pool.request()
      .input('order_id', sql.UniqueIdentifier, orderId)
      .query(`
        SELECT status FROM orders WHERE order_id = @order_id
      `);

    if (checkResult.recordset.length === 0) {
      return null;
    }

    const currentStatus = checkResult.recordset[0].status;
    if (currentStatus === 'CANCELLED') {
      throw new Error('Order already cancelled');
    }

    // Actualizar estado
    await pool.request()
      .input('order_id', sql.UniqueIdentifier, orderId)
      .input('cancelled_at', sql.DateTime2, new Date())
      .input('updated_at', sql.DateTime2, new Date())
      .query(`
        UPDATE orders 
        SET status = 'CANCELLED', cancelled_at = @cancelled_at, updated_at = @updated_at
        WHERE order_id = @order_id
      `);

    this.logger.log(`Order ${orderId} cancelled`);

    return this.getOrder(orderId);
  }

  private buildPackageDescription(pkg: Package): string {
    const parts = [`${pkg.weight_kg}kg`];
    if (pkg.fragile) parts.push('Frágil');
    if (pkg.declared_value_q) parts.push(`Q${pkg.declared_value_q}`);
    return parts.join(', ');
  }
}
