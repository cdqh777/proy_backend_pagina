import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Role } from './role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(User) private repoUsuario: Repository<User>,
    @InjectRepository(Role) private repoRol: Repository<Role>,
  ) {}

  async buscarPorCorreo(correo: string): Promise<User> {
    return this.repoUsuario.findOne({ where: { email: correo }, relations: ['role'] });
  }

  async obtenerTodos(): Promise<User[]> {
    return this.repoUsuario.find({ where: { is_active: 1 }, relations: ['role'] });
  }

  async obtenerUno(id: number): Promise<User> {
    const usuario = await this.repoUsuario.findOne({ where: { id }, relations: ['role'] });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async crear(dto: CreateUserDto): Promise<User> {
    const existente = await this.buscarPorCorreo(dto.email);
    if (existente) throw new ConflictException('El correo ya está registrado');
    const contrasenaEncriptada = await bcrypt.hash(dto.password, 10);
    const usuario = this.repoUsuario.create({ ...dto, password: contrasenaEncriptada });
    return this.repoUsuario.save(usuario);
  }

  async actualizar(id: number, dto: UpdateUserDto): Promise<User> {
    const usuario = await this.obtenerUno(id);
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    Object.assign(usuario, dto);
    return this.repoUsuario.save(usuario);
  }

  async eliminar(id: number): Promise<void> {
    const usuario = await this.obtenerUno(id);
    usuario.is_active = 0;
    await this.repoUsuario.save(usuario);
  }

  async obtenerRoles(): Promise<Role[]> {
    return this.repoRol.find();
  }
}

export { UsuariosService as UsersService };
