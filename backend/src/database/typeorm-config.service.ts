import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { Environment, ConfigType } from '../config/types';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<{ cfg: ConfigType }>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const config = this.configService.getOrThrow<ConfigType>('cfg');
    const dbConfig = config.database;

    const isProd = config.env === Environment.Production;

    return {
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.name,
      dropSchema: false,
      logging: !isProd,
      logger: !isProd ? 'formatted-console' : undefined,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      subscribers: [__dirname + '/subscribers/**/*{.ts,.js}'],
      retryAttempts: 10,
      retryDelay: 3000,
      autoLoadEntities: true,
    };
  }
}
