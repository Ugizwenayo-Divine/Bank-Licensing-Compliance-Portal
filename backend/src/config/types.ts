export enum Environment {
  Dev = 'dev',
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Test = 'test',
}

export type DatabaseConfigType = {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
};

export type ConfigType = {
  env: Environment;
  port: number;
  apiPrefix: string;
  corsAllowedDomains: string[];
  jwtSecret: string;
  jwtExpiration: string;
  fileStorageDir: string;
  database: DatabaseConfigType;
};
