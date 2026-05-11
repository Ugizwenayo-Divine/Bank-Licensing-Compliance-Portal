import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

const { env } = process;

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DB_URL as string,
  host: env.DB_HOST as string,
  port: env.DB_PORT ? parseInt(env.DB_PORT, 10) : 1433,
  username: env.DB_USERNAME as string,
  password: env.DB_PASSWORD as string,
  database: env.DB_NAME as string,
  synchronize: env.NODE_ENV !== 'production',
  dropSchema: false,
  keepConnectionAlive: true,
  logging: env.NODE_ENV !== 'production',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
} as DataSourceOptions);
