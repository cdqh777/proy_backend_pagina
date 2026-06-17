import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sugerencia } from './suggestion.entity';
import { SugerenciasService } from './suggestions.service';
import { SugerenciasController } from './suggestions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sugerencia])],
  providers: [SugerenciasService],
  controllers: [SugerenciasController],
  exports: [SugerenciasService],
})
export class SugerenciasModule {}

export { SugerenciasModule as SuggestionsModule };
