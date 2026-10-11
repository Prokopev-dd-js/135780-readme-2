import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
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
import {
  CreatePublicationDto,
  PublicationQueryDto,
  SearchPublicationQueryDto,
  UpdatePublicationDto,
} from '@project/shared-api';
import { PublicationStatus } from '@project/shared-types';
import { Access, RouteAccess } from '../auth/route-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { BackendClient, BackendService } from '../backend/backend-client';
import { ApiBackendResponses } from '../backend/api-backend-responses.decorator';
import {
  PresentationService,
  type PublicationData,
  type PublicationView,
} from '../presentation/presentation.service';
import { PublicationResponseDto } from '../presentation/response.dto';

@ApiTags('publications')
@ApiBackendResponses()
@Controller('publications')
export class PublicationsController {
  public constructor(
    private readonly backend: BackendClient,
    private readonly presentation: PresentationService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a publication' })
  @ApiCreatedResponse({ type: PublicationResponseDto })
  public async create(
    @Body() dto: CreatePublicationDto,
    @CurrentUser() userId: string,
  ): Promise<PublicationView> {
    if (dto.photoId) {
      await this.presentation.file(dto.photoId);
    }
    const publication = await this.backend.request<PublicationData>(
      BackendService.Publication,
      'POST',
      '/publications',
      { body: dto, userId },
    );
    return (await this.presentation.publications([publication]))[0];
  }

  @Get()
  @Access(RouteAccess.Public)
  @ApiOperation({
    summary:
      'Get a filtered and paginated list of publications with authors and images',
  })
  @ApiOkResponse({ type: [PublicationResponseDto] })
  public async list(
    @Query() query: PublicationQueryDto,
  ): Promise<PublicationView[]> {
    const publications = await this.backend.request<PublicationData[]>(
      BackendService.Publication,
      'GET',
      '/publications',
      { query },
    );
    return this.presentation.publications(publications);
  }

  @Get('search')
  @Access(RouteAccess.Public)
  @ApiOperation({ summary: 'Search published posts by title' })
  @ApiOkResponse({ type: [PublicationResponseDto] })
  public async search(
    @Query() query: SearchPublicationQueryDto,
  ): Promise<PublicationView[]> {
    const publications = await this.backend.request<PublicationData[]>(
      BackendService.Publication,
      'GET',
      '/publications/search',
      { query },
    );
    return this.presentation.publications(publications);
  }

  @Get('drafts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user drafts' })
  @ApiOkResponse({ type: [PublicationResponseDto] })
  public async drafts(
    @CurrentUser() userId: string,
  ): Promise<PublicationView[]> {
    const publications = await this.backend.request<PublicationData[]>(
      BackendService.Publication,
      'GET',
      '/publications/drafts',
      { userId },
    );
    return this.presentation.publications(publications);
  }

  @Get(':id')
  @Access(RouteAccess.Public)
  @ApiOperation({ summary: 'Get a published post or an own draft' })
  @ApiOkResponse({ type: PublicationResponseDto })
  public async get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId?: string,
  ): Promise<PublicationView> {
    const publication = await this.backend.request<PublicationData>(
      BackendService.Publication,
      'GET',
      `/publications/${id}`,
    );
    if (
      publication.status === PublicationStatus.Draft &&
      publication.authorId !== userId
    ) {
      throw new NotFoundException('Publication not found');
    }
    return (await this.presentation.publications([publication]))[0];
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit an own publication' })
  @ApiOkResponse({ type: PublicationResponseDto })
  public async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePublicationDto,
    @CurrentUser() userId: string,
  ): Promise<PublicationView> {
    if (dto.photoId) {
      await this.presentation.file(dto.photoId);
    }
    const publication = await this.backend.request<PublicationData>(
      BackendService.Publication,
      'PATCH',
      `/publications/${id}`,
      { body: dto, userId },
    );
    return (await this.presentation.publications([publication]))[0];
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an own publication' })
  @ApiNoContentResponse({ description: 'Publication deleted' })
  public async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    await this.backend.request(
      BackendService.Publication,
      'DELETE',
      `/publications/${id}`,
      { userId },
    );
  }

  @Post(':id/repost')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Repost a publication' })
  @ApiCreatedResponse({ type: PublicationResponseDto })
  public async repost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string,
  ): Promise<PublicationView> {
    const publication = await this.backend.request<PublicationData>(
      BackendService.Publication,
      'POST',
      `/publications/${id}/repost`,
      { userId },
    );
    return (await this.presentation.publications([publication]))[0];
  }
}
