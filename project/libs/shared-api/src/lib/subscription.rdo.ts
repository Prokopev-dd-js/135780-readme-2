import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionRdo {
  @ApiProperty({ format: 'uuid' }) public id!: string;
  @ApiProperty({ format: 'uuid' }) public subscriberId!: string;
  @ApiProperty({ format: 'uuid' }) public authorId!: string;
  @ApiProperty({ type: String, format: 'date-time' }) public createdAt!: Date;
}
