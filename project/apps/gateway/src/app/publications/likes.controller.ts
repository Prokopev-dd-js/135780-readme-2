import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Like } from '@project/shared-types';
import { CurrentUser } from '../auth/current-user.decorator';
import { BackendClient, BackendService } from '../backend/backend-client';
import { ApiBackendResponses } from '../backend/api-backend-responses.decorator';
import { LikeResponseDto } from '../presentation/response.dto';

@ApiTags('likes')
@ApiBearerAuth()
@ApiBackendResponses()
@Controller('publications/:publicationId/likes')
export class LikesController {
  public constructor(private readonly backend: BackendClient) {}

  @Post()
  @ApiOperation({ summary: 'Like a publication as the current user' })
  @ApiCreatedResponse({ type: LikeResponseDto })
  public add(
    @Param('publicationId', ParseUUIDPipe) publicationId: string,
    @CurrentUser() userId: string,
  ): Promise<Like> {
    return this.backend.request(
      BackendService.Publication,
      'POST',
      `/publications/${publicationId}/likes`,
      { userId },
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove the current user like' })
  @ApiNoContentResponse({ description: 'Like removed' })
  public async remove(
    @Param('publicationId', ParseUUIDPipe) publicationId: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    await this.backend.request(
      BackendService.Publication,
      'DELETE',
      `/publications/${publicationId}/likes`,
      { userId },
    );
  }
}
