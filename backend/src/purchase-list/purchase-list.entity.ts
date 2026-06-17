import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Articulo } from '../articles/article.entity';
import { Sugerencia } from '../suggestions/suggestion.entity';

@Entity('lista_compras')
export class ItemListaCompras {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'articulo_id', nullable: true })
  article_id: number;

  @ManyToOne(() => Articulo, { nullable: true })
  @JoinColumn({ name: 'articulo_id' })
  article: Articulo;

  @Column({ name: 'sugerencia_id', nullable: true })
  suggestion_id: number;

  @ManyToOne(() => Sugerencia, { nullable: true })
  @JoinColumn({ name: 'sugerencia_id' })
  suggestion: Sugerencia;

  @Column({ name: 'cantidad', default: 1 })
  quantity: number;

  @Column({ name: 'precio_estimado', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimated_price: number;

  @Column({ name: 'prioridad', type: 'enum', enum: ['alta', 'media', 'baja'], default: 'media' })
  priority: string;

  @Column({ name: 'estado', type: 'enum', enum: ['pendiente', 'comprado', 'cancelado'], default: 'pendiente' })
  status: string;

  @Column({ name: 'notas', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'activo', default: 1 })
  is_active: number;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}

export { ItemListaCompras as PurchaseListItem };