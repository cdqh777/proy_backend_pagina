import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ArticleType } from '../categories/article-type.entity';

@Entity('articulos')
export class Articulo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', length: 150 })
  name: string;

  @Column({ name: 'tipo_articulo_id' })
  article_type_id: number;

  @ManyToOne(() => ArticleType, (tipo) => tipo.articles)
  @JoinColumn({ name: 'tipo_articulo_id' })
  articleType: ArticleType;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'precio', type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'stock', default: 0 })
  stock: number;

  @Column({ name: 'stock_minimo', default: 5 })
  min_stock: number;

  @Column({ name: 'cantidad_compras', default: 0 })
  purchase_count: number;

  @Column({ name: 'estado', type: 'enum', enum: ['nuevo', 'disponible', 'agotado'], default: 'nuevo' })
  status: string;

  @Column({ name: 'activo', default: 1 })
  is_active: number;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}

export { Articulo as Article };