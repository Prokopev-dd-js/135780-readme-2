import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FileService } from './file.service';
import { FileDiskRepository } from './file-disk.repository';

test('image bytes and metadata survive recreating the repository', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'readme-images-'));
  try {
    const config = new ConfigService({ UPLOAD_DIRECTORY: directory });
    const service = new FileService(new FileDiskRepository(config));
    const buffer = Buffer.from('image-content');
    const file = await service.save({
      originalname: '../avatar.png',
      mimetype: 'image/png',
      size: buffer.length,
      buffer,
    });
    const restarted = new FileService(new FileDiskRepository(config));
    const metadata = await restarted.getById(file.id);
    assert.equal(metadata.originalName, '../avatar.png');
    assert.equal(
      metadata.createdAt.toISOString(),
      file.createdAt.toISOString(),
    );
    assert.equal(metadata.path, `/api/files/${file.id}/content`);
    assert.deepEqual((await restarted.getContent(file.id)).buffer, buffer);
    await assert.rejects(
      restarted.getContent('00000000-0000-4000-8000-000000000000'),
      NotFoundException,
    );
    const tooLarge = Buffer.alloc(500 * 1024 + 1);
    const photo = await restarted.save({
      originalname: 'large.png',
      mimetype: 'image/png',
      size: tooLarge.length,
      buffer: tooLarge,
    });
    await assert.rejects(
      restarted.getAvatarById(photo.id),
      BadRequestException,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
