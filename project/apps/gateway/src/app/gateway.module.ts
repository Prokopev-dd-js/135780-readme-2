import { Module } from '@nestjs/common';
import { BackendModule } from './backend/backend.module';
import { UsersGatewayModule } from './users/users.module';
import { PublicationsGatewayModule } from './publications/publications.module';
import { FilesGatewayModule } from './files/files.module';
import { SubscriptionsGatewayModule } from './subscriptions/subscriptions.module';
import { NotificationsGatewayModule } from './notifications/notifications.module';
@Module({
  imports: [
    BackendModule,
    UsersGatewayModule,
    PublicationsGatewayModule,
    FilesGatewayModule,
    SubscriptionsGatewayModule,
    NotificationsGatewayModule,
  ],
})
export class GatewayModule {}
