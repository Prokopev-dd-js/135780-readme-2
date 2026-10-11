import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CommentQueryDto, CreateCommentDto } from '@project/shared-api';
import { Access, RouteAccess } from '../auth/route-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { BackendClient, BackendService } from '../backend/backend-client';
import { ApiBackendResponses } from '../backend/api-backend-responses.decorator';
import {
  PresentationService,
  type CommentData,
  type CommentView,
} from '../presentation/presentation.service';
import { CommentResponseDto } from '../presentation/response.dto';

@ApiTags('comments')
@ApiBackendResponses()
@Controller('publications/:publicationId/comments')
export class CommentsController {
  public constructor(
    private readonly backend: BackendClient,
    private readonly presentation: PresentationService,
  ) {}

  @Get()
  @Access(RouteAccess.Public)
  @ApiOperation({ summary: 'Get paginated comments with authors' })
  @ApiOkResponse({ type: [CommentResponseDto] })
  public async list(
    @Param('publicationId', ParseUUIDPipe) publicationId: string,
    @Query() query: CommentQueryDto,
  ): Promise<CommentView[]> {
    const comments = await this.backend.request<CommentData[]>(
      BackendService.Publication,
      'GET',
      `/publications/${publicationId}/comments`,
      { query },
    );
    return this.presentation.comments(comments);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comment on a published post' })
  @ApiCreatedResponse({ type: CommentResponseDto })
  public async create(
    @Param('publicationId', ParseUUIDPipe) publicationId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentView> {
    const comment = await this.backend.request<CommentData>(
      BackendService.Publication,
      'POST',
      `/publications/${publicationId}/comments`,
      { body: dto, userId },
    );
    return (await this.presentation.comments([comment]))[0];
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an own comment' })
  @ApiNoContentResponse({ description: 'Comment deleted' })
  public async delete(
    @Param('publicationId', ParseUUIDPipe) publicationId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    await this.backend.request(
      BackendService.Publication,
      'DELETE',
      `/publications/${publicationId}/comments/${id}`,
      { userId },
    );
  }
}
