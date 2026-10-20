import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePublicationDto,
  PublicationQueryDto,
  SearchPublicationQueryDto,
  UpdatePublicationDto,
} from '@project/shared-api';
import { PublicationStatus } from '@project/shared-types';
import { BackendClient, BackendService } from '../backend/backend-client';
import {
  PresentationService,
  type PublicationData,
  type PublicationView,
} from '../presentation/presentation.service';

@Injectable()
export class PublicationsGatewayService {
  public constructor(
    private readonly backend: BackendClient,
    private readonly presentation: PresentationService,
  ) {}

  public async create(
    dto: CreatePublicationDto,
    userId: string,
  ): Promise<PublicationView> {
    if (dto.photoId) {
      await this.presentation.getFile(dto.photoId);
    }
    const publication = await this.backend.request<PublicationData>(
      BackendService.Publication,
      'POST',
      '/publications',
      { body: dto, userId },
    );
    return (await this.presentation.getPublications([publication]))[0];
  }

  public async find(query: PublicationQueryDto): Promise<PublicationView[]> {
    return this.presentation.getPublications(
      await this.backend.request<PublicationData[]>(
        BackendService.Publication,
        'GET',
        '/publications',
        { query },
      ),
    );
  }

  public async search(
    query: SearchPublicationQueryDto,
  ): Promise<PublicationView[]> {
    return this.presentation.getPublications(
      await this.backend.request<PublicationData[]>(
        BackendService.Publication,
        'GET',
        '/publications/search',
        { query },
      ),
    );
  }

  public async findDrafts(userId: string): Promise<PublicationView[]> {
    return this.presentation.getPublications(
      await this.backend.request<PublicationData[]>(
        BackendService.Publication,
        'GET',
        '/publications/drafts',
        { userId },
      ),
    );
  }

  public async getById(id: string, userId?: string): Promise<PublicationView> {
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
    return (await this.presentation.getPublications([publication]))[0];
  }

  public async update(
    id: string,
    dto: UpdatePublicationDto,
    userId: string,
  ): Promise<PublicationView> {
    if (dto.photoId) {
      await this.presentation.getFile(dto.photoId);
    }
    const publication = await this.backend.request<PublicationData>(
      BackendService.Publication,
      'PATCH',
      `/publications/${id}`,
      { body: dto, userId },
    );
    return (await this.presentation.getPublications([publication]))[0];
  }

  public async delete(id: string, userId: string): Promise<void> {
    await this.backend.request(
      BackendService.Publication,
      'DELETE',
      `/publications/${id}`,
      { userId },
    );
  }

  public async repost(id: string, userId: string): Promise<PublicationView> {
    const publication = await this.backend.request<PublicationData>(
      BackendService.Publication,
      'POST',
      `/publications/${id}/repost`,
      { userId },
    );
    return (await this.presentation.getPublications([publication]))[0];
  }

  public async findFeed(
    query: PublicationQueryDto,
    userId: string,
  ): Promise<PublicationView[]> {
    const subscriptions = await this.backend.request<{ authorId: string }[]>(
      BackendService.Account,
      'GET',
      '/subscriptions',
      { userId },
    );
    const publications = await this.backend.request<PublicationData[]>(
      BackendService.Publication,
      'POST',
      '/publications/feed',
      {
        body: {
          ...query,
          authorIds: subscriptions.map((item) => item.authorId),
        },
        userId,
      },
    );
    return this.presentation.getPublications(publications);
  }
}
