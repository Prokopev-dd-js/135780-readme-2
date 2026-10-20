import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesGatewayService } from './files.service';

@Module({ controllers: [FilesController], providers: [FilesGatewayService] })
export class FilesGatewayModule {}
