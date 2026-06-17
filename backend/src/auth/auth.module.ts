import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EstrategiaJwt } from './jwt.strategy';
import { EstrategiaLocal } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { RegistroAcceso } from '../access-log/access-log.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([RegistroAcceso]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (servicioConfig: ConfigService) => ({
        secret: servicioConfig.get('JWT_SECRET', 'secreto'),
        signOptions: { expiresIn: servicioConfig.get('JWT_EXPIRES_IN', '8h') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, EstrategiaJwt, EstrategiaLocal],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
