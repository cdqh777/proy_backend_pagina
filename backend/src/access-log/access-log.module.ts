import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroAcceso } from './access-log.entity';
import { RegistroAccesoService } from './access-log.service';
import { RegistroAccesoController } from './access-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroAcceso])],
  providers: [RegistroAccesoService],
  controllers: [RegistroAccesoController],
  exports: [RegistroAccesoService],
})
export class RegistroAccesoModule {}

export { RegistroAccesoModule as AccessLogModule };
