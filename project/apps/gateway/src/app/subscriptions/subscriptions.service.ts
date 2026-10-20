import { Injectable } from '@nestjs/common';
import { BackendClient, BackendService } from '../backend/backend-client';
import {
  PresentationService,
  type UserView,
} from '../presentation/presentation.service';

export interface SubscriptionData {
  id: string;
  authorId: string;
  subscriberId: string;
  createdAt: string;
}
export type SubscriptionView = SubscriptionData & { author: UserView };

@Injectable()
export class SubscriptionsGatewayService {
  public constructor(
    private readonly backend: BackendClient,
    private readonly presentation: PresentationService,
  ) {}

  public async find(userId: string): Promise<SubscriptionView[]> {
    const subscriptions = await this.backend.request<SubscriptionData[]>(
      BackendService.Account,
      'GET',
      '/subscriptions',
      { userId },
    );
    return Promise.all(
      subscriptions.map(async (item) => ({
        ...item,
        author: await this.presentation.getUser(item.authorId),
      })),
    );
  }

  public async subscribe(
    userId: string,
    authorId: string,
  ): Promise<SubscriptionView> {
    const subscription = await this.backend.request<SubscriptionData>(
      BackendService.Account,
      'POST',
      `/subscriptions/${authorId}`,
      { userId },
    );
    return {
      ...subscription,
      author: await this.presentation.getUser(authorId),
    };
  }

  public async unsubscribe(userId: string, authorId: string): Promise<void> {
    await this.backend.request(
      BackendService.Account,
      'DELETE',
      `/subscriptions/${authorId}`,
      { userId },
    );
  }
}
