import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Subscription } from '@project/shared-types';
import { SubscriptionRepository } from './subscription.repository';

@Injectable()
export class SubscriptionService {
  public constructor(private readonly repository: SubscriptionRepository) {}

  public async subscribe(
    subscriberId: string,
    authorId: string,
  ): Promise<Subscription> {
    if (subscriberId === authorId) {
      throw new BadRequestException('Self-subscription is not allowed');
    }
    if (!(await this.repository.authorExists(authorId))) {
      throw new NotFoundException('Author not found');
    }
    return this.repository.subscribe(subscriberId, authorId);
  }

  public unsubscribe(subscriberId: string, authorId: string): Promise<void> {
    return this.repository.unsubscribe(subscriberId, authorId);
  }

  public findBySubscriberId(subscriberId: string): Promise<Subscription[]> {
    return this.repository.findBySubscriberId(subscriberId);
  }
}
