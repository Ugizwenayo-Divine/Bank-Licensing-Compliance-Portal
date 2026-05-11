import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { LocalFileStorageService } from '../src/storage/local-file-storage.service';
import { ConfigType } from 'src/config/types';

describe('LocalFileStorageService', () => {
  let service: LocalFileStorageService;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'storage-test-'));
    const config = {
      get: (key: string, defaultValue: string) => {
        return {
          key,
          fileStorageDir: defaultValue || tmpDir,
        };
      },
    } as ConfigService<{ cfg: ConfigType }>;
    service = new LocalFileStorageService(config);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('save', () => {
    it('should write a buffer to disk under the given key', async () => {
      const buffer = Buffer.from('hello storage');
      await service.save('test.txt', buffer);

      const written = fs.readFileSync(path.join(tmpDir, 'test.txt'));
      expect(written.equals(buffer)).toBe(true);
    });

    it('should overwrite an existing file when the same key is reused', async () => {
      await service.save('dup.txt', Buffer.from('v1'));
      await service.save('dup.txt', Buffer.from('v2'));

      const content = fs.readFileSync(path.join(tmpDir, 'dup.txt'), 'utf8');
      expect(content).toBe('v2');
    });
  });

  describe('read', () => {
    it('should return a Readable stream for a saved file', async () => {
      const data = Buffer.from('stream me');
      await service.save('readable.bin', data);

      const stream = await service.read('readable.bin');
      expect(stream).toBeInstanceOf(Readable);

      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (chunk: ArrayBuffer) =>
          chunks.push(Buffer.from(chunk)),
        );
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      expect(Buffer.concat(chunks).equals(data)).toBe(true);
    });

    it('should throw NotFoundException when the key does not exist', async () => {
      await expect(service.read('ghost.pdf')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should remove the file from disk', async () => {
      await service.save('remove-me.txt', Buffer.from('bye'));
      await service.delete('remove-me.txt');

      expect(fs.existsSync(path.join(tmpDir, 'remove-me.txt'))).toBe(false);
    });

    it('should not throw when deleting a non-existent key', async () => {
      await expect(service.delete('never-existed.txt')).resolves.not.toThrow();
    });
  });

  describe('path traversal guard', () => {
    it('should reject keys containing directory traversal sequences', async () => {
      await expect(
        service.save('../outside.txt', Buffer.from('evil')),
      ).rejects.toThrow();
    });
  });
});
