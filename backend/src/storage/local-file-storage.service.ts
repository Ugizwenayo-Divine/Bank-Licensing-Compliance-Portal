import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

import { ConfigType } from '../config/types';
import { FileStorageService } from './file-storage.interface';

@Injectable()
export class LocalFileStorageService implements FileStorageService {
  private readonly logger = new Logger(LocalFileStorageService.name);
  private readonly storageDir: string;

  constructor(
    private readonly configService: ConfigService<{ cfg: ConfigType }>,
  ) {
    const config = this.configService.get('cfg') as ConfigType;
    this.storageDir = config.fileStorageDir;

    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
      this.logger.log(`Created local storage directory: ${this.storageDir}`);
    }
  }

  async save(key: string, buffer: Buffer): Promise<void> {
    const filePath = this.resolvePath(key);
    await fs.promises.writeFile(filePath, buffer);
    this.logger.debug(`Saved file: ${key} (${buffer.length} bytes)`);
  }

  async read(key: string): Promise<Readable> {
    const filePath = this.resolvePath(key);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File not found in storage: ${key}`);
    }

    return Promise.resolve(fs.createReadStream(filePath));
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      this.logger.debug(`Deleted file: ${key}`);
    }
  }

  private resolvePath(key: string): string {
    const resolved = path.resolve(this.storageDir, key);
    if (!resolved.startsWith(path.resolve(this.storageDir))) {
      throw new Error(`Invalid storage key: ${key}`);
    }
    return resolved;
  }
}
