import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from '../user/user.model';
import { SubscriptionModel, SubscriptionSchema } from './subscription.model';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionModel.name, schema: SubscriptionSchema },
      { name: UserModel.name, schema: UserSchema },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionRepository, SubscriptionService],
  exports: [SubscriptionRepository],
})
export class SubscriptionModule {}
