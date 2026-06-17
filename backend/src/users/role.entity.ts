import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', length: 50, unique: true })
  name: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}

export { Role as Roles };