import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Articulo } from './article.entity';
import { ArticulosService } from './articles.service';
import { ArticulosController } from './articles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Articulo])],
  providers: [ArticulosService],
  controllers: [ArticulosController],
  exports: [ArticulosService],
})
export class ArticulosModule {}

export { ArticulosModule as ArticlesModule };
