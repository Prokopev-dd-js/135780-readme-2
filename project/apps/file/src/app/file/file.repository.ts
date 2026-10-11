import { FileEntity } from './file.entity';

export const FILE_REPOSITORY = Symbol('FILE_REPOSITORY');

export interface FileRepository {
  save(entity: FileEntity, content: Buffer): Promise<FileEntity>;
  findById(id: string): Promise<FileEntity | null>;
  readContent(id: string): Promise<Buffer | null>;
}
