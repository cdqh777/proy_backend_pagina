import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Articulo } from '../articles/article.entity';
import { User } from '../users/user.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'articulo_id' })
  article_id: number;

  @ManyToOne(() => Articulo)
  @JoinColumn({ name: 'articulo_id' })
  article: Articulo;

  @Column({ name: 'usuario_id' })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @Column({ name: 'cantidad' })
  quantity: number;

  @Column({ name: 'precio_unitario', type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ name: 'total', type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'estado', type: 'enum', enum: ['activa', 'anulada', 'devuelta'], default: 'activa' })
  status: string;

  @Column({ name: 'motivo_reclamo', type: 'text', nullable: true })
  motivo_reclamo: string;

  @CreateDateColumn({ name: 'fecha_venta' })
  sale_date: Date;
}

export { Venta as Sale };