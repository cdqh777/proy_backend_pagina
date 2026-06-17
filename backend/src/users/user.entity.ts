import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', length: 100 })
  name: string;

  @Column({ name: 'correo', length: 150, unique: true })
  email: string;

  @Column({ name: 'contrasena', length: 255 })
  password: string;

  @Column({ name: 'rol_id' })
  role_id: number;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'rol_id' })
  role: Role;

  @Column({ name: 'activo', default: 1 })
  is_active: number;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}