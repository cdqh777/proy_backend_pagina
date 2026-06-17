import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Articulo } from './article.entity';
import { ArticulosService } from './articles.service';
import { ArticulosController } from './articles.controller';
import { ListaComprasModule } from '../purchase-list/purchase-list.module';

@Module({
  imports: [TypeOrmModule.forFeature([Articulo]), forwardRef(() => ListaComprasModule)],
  providers: [ArticulosService],
  controllers: [ArticulosController],
  exports: [ArticulosService],
})
export class ArticulosModule {}

export { ArticulosModule as ArticlesModule };
