import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { Package } from '../database/entities/package.entity';
import { OrderPricing } from '../database/entities/order-pricing.entity';

@Controller()
export class ReceiptController {
  private readonly logger = new Logger(ReceiptController.name);
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(OrderPricing)
    private pricingRepository: Repository<OrderPricing>,
  ) {}

  @GrpcMethod('ReceiptService', 'GenerateReceipt')
  async generateReceipt(data: { order_id: string }) {
    try {
      // 1. Buscar la orden
      const order = await this.orderRepository.findOne({
        where: { order_id: data.order_id },
      });
      this.logger.log(`Starting receipt generation for order ${data.order_id}`);

      if (!order) {
        this.logger.warn(`Order ${data.order_id} not found`);
        throw new Error(`Order ${data.order_id} not found`);
      }

      // 2. Buscar los paquetes
      this.logger.log(`Searching ${data.order_id} packages`);
      const packages = await this.packageRepository.find({
        where: { order_id: data.order_id },
      });

      // 3. Buscar el pricing
      this.logger.log(`Searching pricing for order ${data.order_id}`);
      const pricing = await this.pricingRepository.findOne({
        where: { order_id: data.order_id },
      });

      if (!pricing) {
        this.logger.warn(`Pricing for order ${data.order_id} not found`);
        throw new Error(`Pricing for order ${data.order_id} not found`);
      }

      // 4. Generar el recibo
      this.logger.log(`Formatting receipt for order ${data.order_id}`);
      const receipt = this.formatReceipt(order, packages, pricing);

      return {
        order_id: order.order_id,
        generated_at: new Date().toISOString(),
        content_body: receipt,
      };
    } catch (error) {
      this.logger.error(`Failed to generate receipt: ${error}`);
      console.error('Error generating receipt:', error);
      throw error;
    }
  }

  private formatReceipt(order: Order, packages: Package[], pricing: OrderPricing): string {
    const lines: string[] = [];
    
    lines.push('========================================');
    lines.push('         QUETZAL SHIP RECEIPT');
    lines.push('========================================');
    lines.push('');
    lines.push(`Order ID: ${order.order_id}`);
    lines.push(`Status: ${order.status}`);
    lines.push(`Date: ${order.created_at.toISOString()}`);
    lines.push('');
    lines.push('--- SHIPPING DETAILS ---');
    lines.push(`Origin: ${order.origin}`);
    lines.push(`Destination: ${order.destination}`);
    lines.push(`Service Type: ${order.service_type}`);
    lines.push('');
    lines.push('--- PACKAGES ---');
    
    packages.forEach((pkg, index) => {
      lines.push(`Package ${index + 1}:`);
      lines.push(`  Weight: ${pkg.weight_kg} kg`);
      lines.push(`  Description: ${pkg.description || 'N/A'}`);
      lines.push('');
    });
    
    lines.push('--- PRICING BREAKDOWN ---');
    lines.push(`Base Price: ${pricing.currency} ${pricing.base_price.toFixed(2)}`);
    lines.push(`Zone Surcharge: ${pricing.currency} ${pricing.zone_surcharge.toFixed(2)}`);
    lines.push(`Service Surcharge: ${pricing.currency} ${pricing.service_surcharge.toFixed(2)}`);
    lines.push(`Subtotal: ${pricing.currency} ${pricing.subtotal.toFixed(2)}`);
    
    if (pricing.discount_amount > 0) {
      lines.push(`Discount (${pricing.discount_percentage}%): -${pricing.currency} ${pricing.discount_amount.toFixed(2)}`);
    }
    
    lines.push('');
    lines.push(`TOTAL: ${pricing.currency} ${pricing.total.toFixed(2)}`);
    lines.push('');
    lines.push('========================================');
    lines.push('   Thank you for using Quetzal Ship!');
    lines.push('========================================');
    
    return lines.join('\n');
  }
}
