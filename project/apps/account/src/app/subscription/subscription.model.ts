import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'subscriptions', id: false, versionKey: false })
export class SubscriptionModel {
  @Prop({ type: String, required: true }) public _id!: string;
  @Prop({ type: String, required: true }) public subscriberId!: string;
  @Prop({ type: String, required: true }) public authorId!: string;
  @Prop({ type: Date, required: true }) public createdAt!: Date;
}

export const SubscriptionSchema =
  SchemaFactory.createForClass(SubscriptionModel);
SubscriptionSchema.index({ subscriberId: 1, authorId: 1 }, { unique: true });
SubscriptionSchema.index({ authorId: 1 });
