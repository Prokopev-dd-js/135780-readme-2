import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { CommentModule } from './comment/comment.module';
import { validateEnvironment } from './config/environment.validation';
import { LikeModule } from './like/like.module';
import { PrismaModule } from './prisma/prisma.module';
import { PublicationModule } from './publication/publication.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['apps/publication/.env', '.env'],
      validate: validateEnvironment,
    }),
    PrismaModule,
    PublicationModule,
    CommentModule,
    LikeModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: PrismaExceptionFilter }],
})
export class AppModule {}
