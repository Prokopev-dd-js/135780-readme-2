import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileDiskRepository } from './file-disk.repository';
import { IMAGE_LIMITS } from './file.constants';

test('HTTP uploads accept exact size limits and reject larger images', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'readme-http-images-'));
  const service = new FileService(
    new FileDiskRepository(new ConfigService({ UPLOAD_DIRECTORY: directory })),
  );
  Reflect.defineMetadata('design:paramtypes', [FileService], FileController);
  const module = await Test.createTestingModule({
    controllers: [FileController],
    providers: [{ provide: FileService, useValue: service }],
  }).compile();
  const app = module.createNestApplication({ logger: false });
  try {
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j1ioAAAAASUVORK5CYII=',
      'base64',
    );
    for (const [path, limit] of [
      ['/files/avatar', IMAGE_LIMITS.avatar],
      ['/files', IMAGE_LIMITS.publication],
    ] as const) {
      for (const [size, expected] of [
        [limit, 201],
        [limit + 1, 413],
      ] as const) {
        const bytes = Buffer.concat([png, Buffer.alloc(size - png.length)]);
        const form = new FormData();
        form.append('file', new Blob([bytes]), 'image.png');
        const response = await fetch(base + path, {
          method: 'POST',
          body: form,
        });
        assert.equal(response.status, expected, `${path}: ${size} bytes`);
        if (expected === 201) {
          const metadata = (await response.json()) as {
            id: string;
            mimeType: string;
          };
          assert.equal(metadata.mimeType, 'image/png');
          const image = await fetch(`${base}/files/${metadata.id}/content`);
          assert.deepEqual(Buffer.from(await image.arrayBuffer()), bytes);
        }
      }
    }
  } finally {
    await app.close();
    await rm(directory, { recursive: true, force: true });
  }
});
