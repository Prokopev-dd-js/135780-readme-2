import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PublicationSort, PublicationStatus } from '@project/shared-types';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { FeedQueryDto } from '@project/shared-api';
import { QUERY_LIMITS } from '../common/query.constants';
import { PublicationNotificationPublisher } from '../notification/notification.publisher';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { PublicationQueryDto } from './dto/publication-query.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationEntity } from './publication.entity';
import {
  PUBLICATION_REPOSITORY,
  type PublicationRepository,
} from './publication.repository';

@Injectable()
export class PublicationService {
  public constructor(
    @Inject(PUBLICATION_REPOSITORY)
    private readonly repository: PublicationRepository,
    private readonly notificationPublisher: PublicationNotificationPublisher,
  ) {}

  public async create(
    dto: CreatePublicationDto,
    authorId: string,
  ): Promise<PublicationEntity> {
    const entity = await this.repository.save(
      new PublicationEntity(dto, authorId),
    );
    if (entity.status === PublicationStatus.Published) {
      await this.publish(entity);
    }
    return entity;
  }

  public async countPublishedByAuthor(
    authorId: string,
  ): Promise<{ publicationCount: number }> {
    return {
      publicationCount: await this.repository.countPublishedByAuthor(authorId),
    };
  }

  public async findPublished(
    query: PublicationQueryDto,
  ): Promise<PublicationEntity[]> {
    return this.repository.findPublished({
      ...query,
      sort: query.sort ?? PublicationSort.PublishedAt,
      page: query.page ?? QUERY_LIMITS.defaultPage,
      limit: query.limit ?? QUERY_LIMITS.publicationsPerPage,
    });
  }

  public findFeed(
    query: FeedQueryDto,
    userId: string,
  ): Promise<PublicationEntity[]> {
    const authorIds = [...new Set([userId, ...query.authorIds])].filter(
      (id) => !query.authorId || id === query.authorId,
    );
    return this.repository.findPublished({
      ...query,
      authorIds,
      sort: query.sort ?? PublicationSort.PublishedAt,
      page: query.page ?? QUERY_LIMITS.defaultPage,
      limit: query.limit ?? QUERY_LIMITS.publicationsPerPage,
    });
  }

  public async findDrafts(authorId: string): Promise<PublicationEntity[]> {
    return this.repository.findDrafts(authorId);
  }

  public async search(title: string): Promise<PublicationEntity[]> {
    return this.repository.search(title, QUERY_LIMITS.searchResults);
  }

  public async getById(id: string): Promise<PublicationEntity> {
    const entity = await this.repository.findById(id);

    if (!entity) {
      throw new NotFoundException('Publication not found');
    }

    return entity;
  }

  public async getPublishedById(id: string): Promise<PublicationEntity> {
    const entity = await this.getById(id);

    if (entity.status !== PublicationStatus.Published) {
      throw new NotFoundException('Published publication not found');
    }

    return entity;
  }

  public async update(
    id: string,
    dto: UpdatePublicationDto,
    authorId: string,
  ): Promise<PublicationEntity> {
    const entity = await this.getById(id);
    this.ensureOwner(entity, authorId);
    const wasDraft = entity.status === PublicationStatus.Draft;
    const changes = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );
    const candidate = plainToInstance(CreatePublicationDto, {
      ...entity,
      ...changes,
    });
    const errors = await validate(candidate, { whitelist: true });
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.flatMap((error) => Object.values(error.constraints ?? {})),
      );
    }
    entity.update(dto);
    const saved = await this.repository.save(entity);
    if (wasDraft && saved.status === PublicationStatus.Published) {
      await this.publish(saved);
    } else if (saved.status === PublicationStatus.Published) {
      await this.notificationPublisher.publishPublicationChanged(
        this.createEvent(saved),
      );
    } else if (!wasDraft) {
      await this.notificationPublisher.publishPublicationWithdrawn(saved.id);
    }
    return saved;
  }

  public async delete(id: string, authorId: string): Promise<void> {
    const entity = await this.getById(id);
    this.ensureOwner(entity, authorId);
    await this.repository.delete(id);
    await this.notificationPublisher.publishPublicationWithdrawn(id);
  }

  public async repost(
    id: string,
    authorId: string,
  ): Promise<PublicationEntity> {
    const original = await this.getPublishedById(id);

    if ((original.originalAuthorId ?? original.authorId) === authorId) {
      throw new BadRequestException('Own publication cannot be reposted');
    }
    const existingRepost = await this.repository.findRepost(
      authorId,
      original.originalPublicationId ?? original.id,
    );

    if (existingRepost) {
      throw new ConflictException('Publication has already been reposted');
    }

    const repost = await this.repository.save(
      PublicationEntity.createRepost(original, authorId),
    );
    await this.publish(repost);
    return repost;
  }

  private async publish(entity: PublicationEntity): Promise<void> {
    await this.notificationPublisher.publishPublicationPublished(
      this.createEvent(entity),
    );
  }

  private createEvent(entity: PublicationEntity) {
    return {
      publicationId: entity.id,
      authorId: entity.authorId,
      type: entity.type,
      title: entity.title,
      publishedAt: entity.publishedAt.toISOString(),
    };
  }

  private ensureOwner(entity: PublicationEntity, authorId: string): void {
    if (entity.authorId !== authorId) {
      throw new ForbiddenException('Only the author can change publication');
    }
  }
}
