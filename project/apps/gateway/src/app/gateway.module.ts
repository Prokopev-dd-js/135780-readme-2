import { Module } from '@nestjs/common';
import { BackendClient } from './backend/backend-client';
import { PresentationService } from './presentation/presentation.service';
import { UsersController } from './users/users.controller';
import { PublicationsController } from './publications/publications.controller';
import { CommentsController } from './publications/comments.controller';
import { LikesController } from './publications/likes.controller';
import { FilesController } from './files/files.controller';
import { NotificationsController } from './notifications/notifications.controller';

@Module({
  controllers: [
    UsersController,
    PublicationsController,
    CommentsController,
    LikesController,
    FilesController,
    NotificationsController,
  ],
  providers: [BackendClient, PresentationService],
})
export class GatewayModule {}
