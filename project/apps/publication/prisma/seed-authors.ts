import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { hash } from 'bcrypt';
import mongoose from 'mongoose';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PrismaClient } from '@prisma/client';
import { NotificationRabbitRouting } from '@project/shared-types';
import { SEED_ID, SEED_CONTENT } from './seed.constants';

const PASSWORD_LIMITS = { minimum: 6, maximum: 12, saltRounds: 10 } as const;
const AUTHORS = [
  {
    id: SEED_ID.author.first,
    email: 'seed-one@example.com',
    name: 'Demo Author One',
  },
  {
    id: SEED_ID.author.second,
    email: 'seed-two@example.com',
    name: 'Demo Author Two',
  },
] as const;

interface SeedUser {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  publicationCount: number;
  subscriberCount: number;
}

export async function seedAuthors(): Promise<void> {
  const password = process.env.SEED_USER_PASSWORD;
  if (
    !password ||
    password.length < PASSWORD_LIMITS.minimum ||
    password.length > PASSWORD_LIMITS.maximum
  ) {
    throw new Error('SEED_USER_PASSWORD must contain 6–12 characters');
  }
  const account = {
    ...parseEnv(readFileSync(resolve('../account/.env'), 'utf8')),
    ...process.env,
  };
  const get = (key: string): string => {
    const value = account[key];
    if (!value) {
      throw new Error(`Missing account configuration: ${key}`);
    }
    return value;
  };
  const uri = `mongodb://${encodeURIComponent(get('MONGO_USER'))}:${encodeURIComponent(get('MONGO_PASSWORD'))}@${get('MONGO_HOST')}:${get('MONGO_PORT')}/${get('MONGO_DB')}?authSource=${get('MONGO_AUTH_SOURCE')}`;
  const connection = await mongoose.createConnection(uri).asPromise();
  const client = ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL!],
      queue: process.env.RABBITMQ_QUEUE!,
      queueOptions: { durable: true },
      persistent: true,
    },
  });
  try {
    const users = connection.db!.collection<SeedUser>('users');
    const passwordHash = await hash(password, PASSWORD_LIMITS.saltRounds);
    for (const author of AUTHORS) {
      await users.updateOne(
        { _id: author.id },
        {
          $setOnInsert: {
            _id: author.id,
            email: author.email,
            name: author.name,
            passwordHash,
            createdAt: new Date(),
            publicationCount: 0,
            subscriberCount: 0,
          },
        },
        { upsert: true },
      );
      const user = await users.findOne({ _id: author.id });
      if (!user) {
        throw new Error('Seed author was not created');
      }
      await lastValueFrom(
        client.emit(NotificationRabbitRouting.UserRegistered, {
          userId: user._id,
          email: user.email,
          name: user.name,
        }),
      );
    }
  } finally {
    await client.close();
    await connection.close();
  }
}

async function repairLegacySeed(): Promise<void> {
  await seedAuthors();
  const prisma = new PrismaClient();
  try {
    await prisma.publication.updateMany({
      where: { id: SEED_ID.publication.first, text: SEED_CONTENT.legacyText },
      data: { text: SEED_CONTENT.text },
    });
    await prisma.publication.updateMany({
      where: {
        id: SEED_ID.publication.second,
        tags: { equals: [...SEED_CONTENT.legacyTags] },
      },
      data: { tags: [...SEED_CONTENT.tags] },
    });
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.endsWith('seed-authors.ts')) {
  void repairLegacySeed().catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : 'Seed repair failed',
    );
    process.exitCode = 1;
  });
}
