import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Articulo } from '../articles/article.entity';
import { Venta } from '../sales/sale.entity';
import { Sugerencia } from '../suggestions/suggestion.entity';
import { AgenteService } from './agente.service';
import { AgenteController } from './agente.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Articulo, Venta, Sugerencia])],
  providers: [AgenteService],
  controllers: [AgenteController],
})
export class AgenteModule {}
