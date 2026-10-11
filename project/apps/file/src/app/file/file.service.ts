import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IMAGE_LIMITS } from './file.constants';
import { FileEntity } from './file.entity';
import { FILE_REPOSITORY, type FileRepository } from './file.repository';
import type { UploadedFileData } from './uploaded-file.interface';

@Injectable()
export class FileService {
  public constructor(
    @Inject(FILE_REPOSITORY)
    private readonly repository: FileRepository,
  ) {}

  public async save(file: UploadedFileData): Promise<FileEntity> {
    return this.repository.save(new FileEntity(file), file.buffer);
  }

  public async getContent(
    id: string,
  ): Promise<{ metadata: FileEntity; buffer: Buffer }> {
    const metadata = await this.getById(id);
    const buffer = await this.repository.readContent(id);
    if (!buffer) {
      throw new NotFoundException('File content not found');
    }
    return { metadata, buffer };
  }

  public async getAvatarById(id: string): Promise<FileEntity> {
    const entity = await this.getById(id);
    if (entity.size > IMAGE_LIMITS.avatar) {
      throw new BadRequestException('Avatar must not exceed 500 KB');
    }
    return entity;
  }

  public async getById(id: string): Promise<FileEntity> {
    const entity = await this.repository.findById(id);

    if (!entity) {
      throw new NotFoundException('File not found');
    }

    return entity;
  }
}
