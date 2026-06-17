import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sugerencia } from './suggestion.entity';
import { SugerenciasService } from './suggestions.service';
import { SugerenciasController } from './suggestions.controller';
import { ListaComprasModule } from '../purchase-list/purchase-list.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sugerencia]), forwardRef(() => ListaComprasModule)],
  providers: [SugerenciasService],
  controllers: [SugerenciasController],
  exports: [SugerenciasService],
})
export class SugerenciasModule {}

export { SugerenciasModule as SuggestionsModule };
