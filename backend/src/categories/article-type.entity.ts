import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Articulo } from '../articles/article.entity';

@Entity('tipos_articulo')
export class TipoArticulo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', length: 100, unique: true })
  name: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @OneToMany(() => Articulo, (articulo) => articulo.articleType)
  articles: Articulo[];
}

export { TipoArticulo as ArticleType };