import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ModuloApp } from './app.module';

async function iniciar() {
  const aplicacion = await NestFactory.create(ModuloApp);

  aplicacion.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  aplicacion.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  aplicacion.setGlobalPrefix('api');

  const puerto = process.env.PORT || 3001;
  await aplicacion.listen(puerto);
  console.log(`Servidor corriendo en http://localhost:${puerto}/api`);
}

iniciar();
