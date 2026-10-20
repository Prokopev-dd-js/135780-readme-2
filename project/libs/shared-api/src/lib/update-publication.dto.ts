import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, ValidateIf } from 'class-validator';
import { PublicationContentDto } from './publication-content.dto.js';

export class UpdatePublicationDto extends PublicationContentDto {
  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsDateString({ strict: true })
  public publishedAt?: string;
}
