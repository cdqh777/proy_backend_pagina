import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './users/users.module';
import { ArticulosModule } from './articles/articles.module';
import { CategoriasModule } from './categories/categories.module';
import { VentasModule } from './sales/sales.module';
import { ReportesModule } from './reports/reports.module';
import { SugerenciasModule } from './suggestions/suggestions.module';
import { ListaComprasModule } from './purchase-list/purchase-list.module';
import { RegistroAccesoModule } from './access-log/access-log.module';
import { AgenteModule } from './agente/agente.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (servicioConfig: ConfigService) => ({
        type: 'postgres',
        host:     servicioConfig.get('DB_HOST', 'localhost'),
        port:     +servicioConfig.get('DB_PORT', 5432),
        username: servicioConfig.get('DB_USERNAME', 'root'),
        password: servicioConfig.get('DB_PASSWORD', ''),
        database: servicioConfig.get('DB_DATABASE', 'libreria_inventario'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsuariosModule,
    ArticulosModule,
    CategoriasModule,
    VentasModule,
    ReportesModule,
    SugerenciasModule,
    ListaComprasModule,
    RegistroAccesoModule,
    AgenteModule,
  ],
})
export class ModuloApp {}

export { ModuloApp as AppModule };
