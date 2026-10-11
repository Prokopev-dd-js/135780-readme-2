import { Injectable } from '@nestjs/common';
import type {
  Comment,
  Publication,
  StoredFile,
  UserDetail,
} from '@project/shared-types';
import { BackendClient, BackendService } from '../backend/backend-client';

export type FileData = Omit<StoredFile, 'createdAt'> & { createdAt: string };
export type UserData = Omit<UserDetail, 'createdAt'> & { createdAt: string };
export type PublicationData = Omit<Publication, 'createdAt' | 'publishedAt'> & {
  createdAt: string;
  publishedAt: string;
};
export type CommentData = Omit<Comment, 'createdAt'> & { createdAt: string };
export type UserView = UserData & { avatar?: FileData };
export type PublicationView = PublicationData & {
  author: UserView;
  photo?: FileData;
  originalAuthor?: UserView;
};
export type CommentView = CommentData & { author: UserView };

@Injectable()
export class PresentationService {
  public constructor(private readonly backend: BackendClient) {}

  public file(id: string): Promise<FileData> {
    return this.backend.request(
      BackendService.File,
      'GET',
      `/files/${encodeURIComponent(id)}`,
    );
  }

  public async user(id: string): Promise<UserView> {
    const user = await this.backend.request<UserData>(
      BackendService.Account,
      'GET',
      `/users/${encodeURIComponent(id)}`,
    );
    return this.userView(user);
  }

  public async userView(user: UserData): Promise<UserView> {
    const [count, avatar] = await Promise.all([
      this.backend.request<{ publicationCount: number }>(
        BackendService.Publication,
        'GET',
        '/publications/count',
        { query: { authorId: user.id } },
      ),
      user.avatarId ? this.file(user.avatarId) : undefined,
    ]);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      publicationCount: count.publicationCount,
      subscriberCount: user.subscriberCount,
      ...(user.avatarId ? { avatarId: user.avatarId, avatar } : {}),
    };
  }

  public async publications(
    publications: PublicationData[],
  ): Promise<PublicationView[]> {
    const authors = new Map<string, Promise<UserView>>();
    const images = new Map<string, Promise<FileData>>();
    const author = (id: string): Promise<UserView> => {
      if (!authors.has(id)) {
        authors.set(id, this.user(id));
      }
      return authors.get(id)!;
    };
    const image = (id: string): Promise<FileData> => {
      if (!images.has(id)) {
        images.set(id, this.file(id));
      }
      return images.get(id)!;
    };
    return Promise.all(
      publications.map(async (publication) => {
        const [user, photo, originalAuthor] = await Promise.all([
          author(publication.authorId),
          publication.photoId ? image(publication.photoId) : undefined,
          publication.originalAuthorId
            ? author(publication.originalAuthorId)
            : undefined,
        ]);
        return {
          ...publication,
          author: user,
          ...(photo ? { photo } : {}),
          ...(originalAuthor ? { originalAuthor } : {}),
        };
      }),
    );
  }

  public async comments(comments: CommentData[]): Promise<CommentView[]> {
    const authors = new Map<string, Promise<UserView>>();
    return Promise.all(
      comments.map(async (comment) => {
        if (!authors.has(comment.authorId)) {
          authors.set(comment.authorId, this.user(comment.authorId));
        }
        return { ...comment, author: await authors.get(comment.authorId)! };
      }),
    );
  }
}
