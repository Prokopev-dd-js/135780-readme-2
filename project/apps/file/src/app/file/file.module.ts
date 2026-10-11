import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileDiskRepository } from './file-disk.repository';
import { FILE_REPOSITORY } from './file.repository';
import { FileService } from './file.service';

@Module({
  controllers: [FileController],
  providers: [
    FileService,
    FileDiskRepository,
    {
      provide: FILE_REPOSITORY,
      useExisting: FileDiskRepository,
    },
  ],
})
export class FileModule {}
