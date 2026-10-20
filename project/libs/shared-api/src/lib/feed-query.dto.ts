import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { PublicationQueryDto } from './publication-query.dto.js';

export class FeedQueryDto extends PublicationQueryDto {
  @ApiProperty({
    type: [String],
    description: 'Author identifiers resolved by account through API Gateway',
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  public authorIds!: string[];
}
