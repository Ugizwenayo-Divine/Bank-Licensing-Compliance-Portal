import * as path from 'path';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';
import { ConfigType, Environment } from './types';

class EnvironmentVariablesValidator {
  @IsOptional()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsOptional()
  @IsString()
  API_PREFIX: string;

  @IsNotEmpty()
  @IsString()
  CORS_ALLOWED_DOMAINS: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRATION: string;

  @IsString()
  @IsOptional()
  FILE_STORAGE_DIR: string;

  // DATABASE
  @IsString()
  @IsUrl({ require_tld: false })
  DB_HOST: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;
}

export const createConfig = (): ConfigType => {
  const { env } = process;
  const cfg = plainToInstance(EnvironmentVariablesValidator, env, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(cfg, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  const corsAllowedDomains = String(cfg.CORS_ALLOWED_DOMAINS || '*')
    .split(',')
    .filter((r) => r.trim());
  return {
    env: cfg.NODE_ENV || Environment.Development,
    port: cfg.PORT,
    apiPrefix: cfg.API_PREFIX || 'api/v1',
    corsAllowedDomains: corsAllowedDomains.length ? corsAllowedDomains : ['*'],
    jwtSecret: cfg.JWT_SECRET,
    jwtExpiration: cfg.JWT_EXPIRATION,
    fileStorageDir: cfg.FILE_STORAGE_DIR || path.join(process.cwd(), 'uploads'),
    database: {
      host: cfg.DB_HOST,
      port: cfg.DB_PORT,
      username: cfg.DB_USERNAME,
      password: cfg.DB_PASSWORD,
      name: cfg.DB_NAME,
    },
  };
};
