import { Module } from '@nestjs/common';
import { PublicationsController } from './publications.controller';
import { CommentsController } from './comments.controller';
import { LikesController } from './likes.controller';
import { PublicationsGatewayService } from './publications.service';
import { CommentsGatewayService } from './comments.service';

@Module({
  controllers: [PublicationsController, CommentsController, LikesController],
  providers: [PublicationsGatewayService, CommentsGatewayService],
})
export class PublicationsGatewayModule {}
