import { StoredFile } from '@project/shared-types';
import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import type { UploadedFileData } from './uploaded-file.interface';

export class FileEntity implements StoredFile {
  @ApiProperty({ format: 'uuid' })
  public readonly id: string;
  @ApiProperty()
  public readonly originalName: string;
  @ApiProperty({ enum: ['image/jpeg', 'image/png'] })
  public readonly mimeType: string;
  @ApiProperty()
  public readonly size: number;
  @ApiProperty({ description: 'Relative URL for downloading the image' })
  public readonly path: string;
  @ApiProperty({ type: String, format: 'date-time' })
  public readonly createdAt: Date;

  public constructor(
    file: Pick<UploadedFileData, 'originalname' | 'mimetype' | 'size'>,
    id: string = randomUUID(),
    createdAt = new Date(),
  ) {
    this.id = id;
    this.originalName = file.originalname;
    this.mimeType = file.mimetype;
    this.size = file.size;
    this.path = `/api/files/${this.id}/content`;
    this.createdAt = createdAt;
  }

  public static restore(data: StoredFile): FileEntity {
    return new FileEntity(
      {
        originalname: data.originalName,
        mimetype: data.mimeType,
        size: data.size,
      },
      data.id,
      new Date(data.createdAt),
    );
  }
}
