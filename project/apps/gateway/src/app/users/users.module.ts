import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersGatewayService } from './users.service';

@Module({ controllers: [UsersController], providers: [UsersGatewayService] })
export class UsersGatewayModule {}
