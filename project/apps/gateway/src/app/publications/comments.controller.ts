import { CommentsGatewayService } from './comments.service';
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
import { ApiBackendResponses } from '../backend/api-backend-responses.decorator';
import { type CommentView } from '../presentation/presentation.service';
import { CommentResponseDto } from '../presentation/response.dto';

@ApiTags('comments')
@ApiBackendResponses()
@Controller('publications/:publicationId/comments')
export class CommentsController {
  public constructor(private readonly service: CommentsGatewayService) {}

  @Get()
  @Access(RouteAccess.Public)
  @ApiOperation({ summary: 'Get paginated comments with authors' })
  @ApiOkResponse({ type: [CommentResponseDto] })
  public async list(
    @Param('publicationId', ParseUUIDPipe) publicationId: string,
    @Query() query: CommentQueryDto,
  ): Promise<CommentView[]> {
    return this.service.find(publicationId, query);
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
    return this.service.create(publicationId, userId, dto);
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
    return this.service.delete(publicationId, id, userId);
  }
}
