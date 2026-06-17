import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsNumber()
  article_type_id: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @IsNumber()
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_stock?: number;
}
