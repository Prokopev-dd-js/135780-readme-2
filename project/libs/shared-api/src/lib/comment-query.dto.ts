import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { QUERY_LIMITS } from './query.constants.js';

export class CommentQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: QUERY_LIMITS.maximumPage,
    default: QUERY_LIMITS.defaultPage,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(QUERY_LIMITS.maximumPage)
  public page?: number;
}
