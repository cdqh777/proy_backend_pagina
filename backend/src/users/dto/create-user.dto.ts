import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsEmail({}, { message: 'Correo inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsNumber()
  role_id: number;
}
