import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('registros_acceso')
export class RegistroAcceso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @Column({ name: 'ip', length: 45, nullable: true })
  ip: string;

  @Column({ name: 'evento', type: 'enum', enum: ['login', 'logout'] })
  event: string;

  @Column({ name: 'navegador', length: 255, nullable: true })
  browser: string;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;
}

export { RegistroAcceso as AccessLog };