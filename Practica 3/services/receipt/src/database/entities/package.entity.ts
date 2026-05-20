import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn()
  package_id: number;

  @Column({ type: 'uniqueidentifier' })
  order_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight_kg: number;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'datetime2', default: () => 'GETDATE()' })
  created_at: Date;

  @ManyToOne(() => Order, order => order.packages)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
