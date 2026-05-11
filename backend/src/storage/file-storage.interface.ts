import { Readable } from 'stream';

export interface FileStorageService {
  save(key: string, buffer: Buffer): Promise<void>;

  read(key: string): Promise<Readable>;

  delete(key: string): Promise<void>;
}

export const FILE_STORAGE = Symbol('FILE_STORAGE');
