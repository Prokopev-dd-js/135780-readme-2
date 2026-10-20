import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import type { SubscriptionRepository } from './subscription.repository';

test('self-subscription is rejected before writing data', async () => {
  const service = new SubscriptionService({} as SubscriptionRepository);
  await assert.rejects(service.subscribe('self', 'self'), BadRequestException);
});

test('subscription to a missing author is rejected', async () => {
  const service = new SubscriptionService({
    authorExists: async () => false,
  } as unknown as SubscriptionRepository);
  await assert.rejects(
    service.subscribe('reader', 'missing'),
    NotFoundException,
  );
});
