import {
  Controller,
  Get,
  Header,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { IMAGE_LIMITS } from '@project/shared-api/images';
import { Access, RouteAccess } from '../auth/route-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { BackendClient, BackendService } from '../backend/backend-client';
import { ApiBackendResponses } from '../backend/api-backend-responses.decorator';
import {
  PresentationService,
  type FileData,
} from '../presentation/presentation.service';
import { FileResponseDto } from '../presentation/response.dto';

const UPLOAD_SCHEMA = {
  type: 'object' as const,
  required: ['file'],
  properties: { file: { type: 'string' as const, format: 'binary' } },
};

interface ImageUpload {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@ApiTags('files')
@ApiBackendResponses()
@ApiPayloadTooLargeResponse({ description: 'Image exceeds the allowed size' })
@Controller('files')
export class FilesController {
  public constructor(
    private readonly backend: BackendClient,
    private readonly presentation: PresentationService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: IMAGE_LIMITS.publication + 1, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: UPLOAD_SCHEMA })
  @ApiOperation({
    summary: 'Upload a JPEG or PNG publication image up to 1 MB',
  })
  @ApiCreatedResponse({ type: FileResponseDto })
  public upload(
    @UploadedFile(new ParseFilePipe()) file: ImageUpload,
    @CurrentUser() userId: string,
  ): Promise<FileData> {
    return this.forward(file, '/files', userId);
  }

  @Post('avatar')
  @Access(RouteAccess.Public)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: IMAGE_LIMITS.avatar + 1, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: UPLOAD_SCHEMA })
  @ApiOperation({
    summary: 'Upload a JPEG or PNG avatar up to 500 KB before registration',
  })
  @ApiCreatedResponse({ type: FileResponseDto })
  public avatar(
    @UploadedFile(new ParseFilePipe()) file: ImageUpload,
  ): Promise<FileData> {
    return this.forward(file, '/files/avatar');
  }

  @Get(':id/content')
  @Access(RouteAccess.Public)
  @Header('X-Content-Type-Options', 'nosniff')
  @ApiOperation({ summary: 'Download an image' })
  @ApiProduces('image/jpeg', 'image/png')
  @ApiOkResponse({ schema: { type: 'string', format: 'binary' } })
  public async download(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StreamableFile> {
    const [metadata, buffer] = await Promise.all([
      this.presentation.file(id),
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

  @Get(':id')
  @Access(RouteAccess.Public)
  @ApiOperation({ summary: 'Get image metadata and download URL' })
  @ApiOkResponse({ type: FileResponseDto })
  public metadata(@Param('id', ParseUUIDPipe) id: string): Promise<FileData> {
    return this.presentation.file(id);
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
