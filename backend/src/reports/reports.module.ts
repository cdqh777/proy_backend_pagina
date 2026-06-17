import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from '../sales/sale.entity';
import { Articulo } from '../articles/article.entity';
import { ReportesService } from './reports.service';
import { ReportesController } from './reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, Articulo])],
  providers: [ReportesService],
  controllers: [ReportesController],
})
export class ReportesModule {}

export { ReportesModule as ReportsModule };
