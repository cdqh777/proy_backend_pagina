import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ModuloApp } from './app.module';

const logger = new Logger('Bootstrap');

async function iniciar() {
  try {
    const aplicacion = await NestFactory.create(ModuloApp);

    aplicacion.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    aplicacion.enableCors({
      origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:3000'] : '*',
      credentials: true,
    });

    aplicacion.setGlobalPrefix('api', { exclude: ['/'] });

    const puerto = process.env.PORT || 3001;
    await aplicacion.listen(puerto);
    logger.log(`Servidor corriendo en puerto ${puerto}`);
    logger.log(`DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  } catch (error) {
    logger.error('Error al iniciar la aplicacion', error.message);
    process.exit(1);
  }
}

iniciar();
