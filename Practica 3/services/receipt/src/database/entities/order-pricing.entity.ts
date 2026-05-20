import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_pricing')
export class OrderPricing {
  @PrimaryGeneratedColumn()
  pricing_id: number;

  @Column({ type: 'uniqueidentifier', unique: true })
  order_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_weight_kg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  zone_surcharge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  service_surcharge: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', length: 3, default: 'GTQ' })
  currency: string;

  @Column({ type: 'datetime2', default: () => 'GETDATE()' })
  calculated_at: Date;

  @OneToOne(() => Order, order => order.pricing)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
