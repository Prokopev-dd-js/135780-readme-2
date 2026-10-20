import { Injectable } from '@nestjs/common';
import { CommentQueryDto, CreateCommentDto } from '@project/shared-api';
import { BackendClient, BackendService } from '../backend/backend-client';
import {
  PresentationService,
  type CommentData,
  type CommentView,
} from '../presentation/presentation.service';

@Injectable()
export class CommentsGatewayService {
  public constructor(
    private readonly backend: BackendClient,
    private readonly presentation: PresentationService,
  ) {}

  public async find(
    publicationId: string,
    query: CommentQueryDto,
  ): Promise<CommentView[]> {
    const comments = await this.backend.request<CommentData[]>(
      BackendService.Publication,
      'GET',
      `/publications/${publicationId}/comments`,
      { query },
    );
    return this.presentation.getComments(comments);
  }

  public async create(
    publicationId: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommentView> {
    const comment = await this.backend.request<CommentData>(
      BackendService.Publication,
      'POST',
      `/publications/${publicationId}/comments`,
      { body: dto, userId },
    );
    return (await this.presentation.getComments([comment]))[0];
  }

  public async delete(
    publicationId: string,
    id: string,
    userId: string,
  ): Promise<void> {
    await this.backend.request(
      BackendService.Publication,
      'DELETE',
      `/publications/${publicationId}/comments/${id}`,
      { userId },
    );
  }
}
