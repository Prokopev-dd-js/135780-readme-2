import { Injectable, StreamableFile } from '@nestjs/common';
import { BackendClient, BackendService } from '../backend/backend-client';
import {
  PresentationService,
  type FileData,
} from '../presentation/presentation.service';

export interface ImageUpload {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class FilesGatewayService {
  public constructor(
    private readonly backend: BackendClient,
    private readonly presentation: PresentationService,
  ) {}

  public upload(file: ImageUpload, userId: string): Promise<FileData> {
    return this.forward(file, '/files', userId);
  }

  public uploadAvatar(file: ImageUpload): Promise<FileData> {
    return this.forward(file, '/files/avatar');
  }

  public async download(id: string): Promise<StreamableFile> {
    const [metadata, buffer] = await Promise.all([
      this.presentation.getFile(id),
      this.backend.request<Buffer>(
        BackendService.File,
        'GET',
        `/files/${id}/content`,
        { responseType: 'arraybuffer' },
      ),
    ]);
    return new StreamableFile(buffer, {
      type: metadata.mimeType,
      length: buffer.length,
      disposition: 'inline',
    });
  }

  public getMetadata(id: string): Promise<FileData> {
    return this.presentation.getFile(id);
  }

  private forward(
    file: ImageUpload,
    path: string,
    userId?: string,
  ): Promise<FileData> {
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
      file.originalname,
    );
    return this.backend.request(BackendService.File, 'POST', path, {
      body: form,
      userId,
    });
  }
}
