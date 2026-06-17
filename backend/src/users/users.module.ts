import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './users.service';
import { UsuariosController } from './users.controller';
import { User } from './user.entity';
import { Role } from './role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService],
})
export class UsuariosModule {}

export { UsuariosModule as UsersModule };
