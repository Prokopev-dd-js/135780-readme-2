import { SEED_ID, SEED_CONTENT } from './seed.constants';
import { seedAuthors } from './seed-authors';
import {
  Prisma,
  PrismaClient,
  PublicationStatus,
  PublicationType,
} from '@prisma/client';

const prisma = new PrismaClient();

const publications: Prisma.PublicationUncheckedCreateInput[] = [
  {
    id: SEED_ID.publication.first,
    authorId: SEED_ID.author.first,
    type: PublicationType.text,
    status: PublicationStatus.published,
    createdAt: new Date('2026-01-10T10:00:00.000Z'),
    publishedAt: new Date('2026-01-10T10:00:00.000Z'),
    tags: ['nestjs', 'prisma'],
    likeCount: 1,
    commentCount: 1,
    isRepost: false,
    title: 'Как подключить Prisma к NestJS',
    announcement:
      'Короткое практическое руководство по подключению Prisma к приложению NestJS.',
    text: SEED_CONTENT.text,
  },
  {
    id: SEED_ID.publication.second,
    authorId: SEED_ID.author.second,
    type: PublicationType.quote,
    status: PublicationStatus.published,
    createdAt: new Date('2026-01-11T11:00:00.000Z'),
    publishedAt: new Date('2026-01-11T11:00:00.000Z'),
    tags: [...SEED_CONTENT.tags],
    likeCount: 1,
    commentCount: 1,
    isRepost: false,
    text: 'Хорошая архитектура позволяет менять инфраструктуру, не переписывая бизнес-логику.',
    quoteAuthor: 'Readme Team',
  },
  {
    id: SEED_ID.publication.third,
    authorId: SEED_ID.author.first,
    type: PublicationType.link,
    status: PublicationStatus.draft,
    createdAt: new Date('2026-01-12T12:00:00.000Z'),
    publishedAt: new Date('2026-01-12T12:00:00.000Z'),
    tags: ['postgresql'],
    likeCount: 0,
    commentCount: 0,
    isRepost: false,
    linkUrl: 'https://www.postgresql.org/docs/14/',
    description: 'Документация PostgreSQL 14.',
  },
];

const comments: Prisma.CommentUncheckedCreateInput[] = [
  {
    id: SEED_ID.comment.first,
    publicationId: SEED_ID.publication.first,
    authorId: SEED_ID.author.second,
    text: 'Полезный пример работы с Prisma.',
  },
  {
    id: SEED_ID.comment.second,
    publicationId: SEED_ID.publication.second,
    authorId: SEED_ID.author.first,
    text: 'Согласен с этим подходом.',
  },
];

const likes: Prisma.LikeUncheckedCreateInput[] = [
  {
    id: SEED_ID.like.first,
    publicationId: SEED_ID.publication.first,
    userId: SEED_ID.author.second,
  },
  {
    id: SEED_ID.like.second,
    publicationId: SEED_ID.publication.second,
    userId: SEED_ID.author.first,
  },
];

async function fillDatabase(): Promise<void> {
  await seedAuthors();
  for (const publication of publications) {
    await prisma.publication.upsert({
      where: { id: publication.id },
      create: publication,
      update: publication,
    });
  }

  for (const comment of comments) {
    await prisma.comment.upsert({
      where: { id: comment.id },
      create: comment,
      update: { text: comment.text },
    });
  }

  for (const like of likes) {
    await prisma.like.upsert({
      where: {
        publicationId_userId: {
          publicationId: like.publicationId,
          userId: like.userId,
        },
      },
      create: like,
      update: {},
    });
  }
}

fillDatabase()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
