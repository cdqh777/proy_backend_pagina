import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './sale.entity';
import { VentasService } from './sales.service';
import { VentasController } from './sales.controller';
import { ArticulosModule } from '../articles/articles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Venta]), ArticulosModule],
  providers: [VentasService],
  controllers: [VentasController],
  exports: [VentasService],
})
export class VentasModule {}

export { VentasModule as SalesModule };
