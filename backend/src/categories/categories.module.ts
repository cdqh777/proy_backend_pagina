import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoArticulo } from './article-type.entity';
import { CategoriasService } from './categories.service';
import { CategoriasController } from './categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoArticulo])],
  providers: [CategoriasService],
  controllers: [CategoriasController],
  exports: [CategoriasService],
})
export class CategoriasModule {}

export { CategoriasModule as CategoriesModule };
