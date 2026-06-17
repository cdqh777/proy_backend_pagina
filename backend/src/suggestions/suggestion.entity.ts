import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TipoArticulo } from '../categories/article-type.entity';

@Entity('sugerencias')
export class Sugerencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @Column({ name: 'nombre_articulo', length: 150 })
  article_name: string;

  @Column({ name: 'tipo_articulo_id', nullable: true })
  article_type_id: number;

  @ManyToOne(() => TipoArticulo, { nullable: true })
  @JoinColumn({ name: 'tipo_articulo_id' })
  articleType: TipoArticulo;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'cantidad_solicitudes', default: 1 })
  request_count: number;

  @Column({ name: 'estado', type: 'enum', enum: ['pendiente', 'aprobado', 'rechazado'], default: 'pendiente' })
  status: string;

  @Column({ name: 'activo', default: 1 })
  is_active: number;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}

export { Sugerencia as Suggestion };