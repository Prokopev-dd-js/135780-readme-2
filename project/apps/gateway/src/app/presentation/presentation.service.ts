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

  public getFile(id: string): Promise<FileData> {
    return this.backend.request(
      BackendService.File,
      'GET',
      `/files/${encodeURIComponent(id)}`,
    );
  }

  public async getUser(id: string): Promise<UserView> {
    const user = await this.backend.request<UserData>(
      BackendService.Account,
      'GET',
      `/users/${encodeURIComponent(id)}`,
    );
    return this.createUserView(user);
  }

  public async createUserView(user: UserData): Promise<UserView> {
    const [count, avatar] = await Promise.all([
      this.backend.request<{ publicationCount: number }>(
        BackendService.Publication,
        'GET',
        '/publications/count',
        { query: { authorId: user.id } },
      ),
      user.avatarId ? this.getFile(user.avatarId) : undefined,
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

  public async getPublications(
    publications: PublicationData[],
  ): Promise<PublicationView[]> {
    const authors = new Map<string, Promise<UserView>>();
    const images = new Map<string, Promise<FileData>>();
    const getAuthor = (id: string): Promise<UserView> => {
      if (!authors.has(id)) {
        authors.set(id, this.getUser(id));
      }
      return authors.get(id)!;
    };
    const getImage = (id: string): Promise<FileData> => {
      if (!images.has(id)) {
        images.set(id, this.getFile(id));
      }
      return images.get(id)!;
    };
    return Promise.all(
      publications.map(async (publication) => {
        const [user, photo, originalAuthor] = await Promise.all([
          getAuthor(publication.authorId),
          publication.photoId ? getImage(publication.photoId) : undefined,
          publication.originalAuthorId
            ? getAuthor(publication.originalAuthorId)
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

  public async getComments(comments: CommentData[]): Promise<CommentView[]> {
    const authors = new Map<string, Promise<UserView>>();
    return Promise.all(
      comments.map(async (comment) => {
        if (!authors.has(comment.authorId)) {
          authors.set(comment.authorId, this.getUser(comment.authorId));
        }
        return { ...comment, author: await authors.get(comment.authorId)! };
      }),
    );
  }
}
