import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemListaCompras } from './purchase-list.entity';
import { ListaComprasService } from './purchase-list.service';
import { ListaComprasController } from './purchase-list.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ItemListaCompras])],
  providers: [ListaComprasService],
  controllers: [ListaComprasController],
  exports: [ListaComprasService],
})
export class ListaComprasModule {}

export { ListaComprasModule as PurchaseListModule };
