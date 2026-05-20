import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Package } from './package.entity';
import { OrderPricing } from './order-pricing.entity';

@Entity('orders')
export class Order {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  order_id: string;

  @Column({ type: 'varchar', length: 100 })
  origin: string;

  @Column({ type: 'varchar', length: 100 })
  destination: string;

  @Column({ type: 'varchar', length: 50 })
  service_type: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'GETDATE()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'GETDATE()' })
  updated_at: Date;

  @OneToMany(() => Package, (pkg) => pkg.order)
  packages: Package[];

  @OneToMany(() => OrderPricing, (pricing) => pricing.order)
  pricing: OrderPricing[];
}
