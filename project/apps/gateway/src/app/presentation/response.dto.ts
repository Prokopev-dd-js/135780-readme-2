import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicationStatus, PublicationType } from '@project/shared-types';

export class FileResponseDto {
  @ApiProperty({ format: 'uuid' }) public id!: string;
  @ApiProperty() public originalName!: string;
  @ApiProperty({ enum: ['image/jpeg', 'image/png'] }) public mimeType!: string;
  @ApiProperty() public size!: number;
  @ApiProperty({ description: 'Image URL relative to Gateway origin' })
  public path!: string;
  @ApiProperty({ format: 'date-time' }) public createdAt!: string;
}

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' }) public id!: string;
  @ApiProperty({ format: 'email' }) public email!: string;
  @ApiProperty() public name!: string;
  @ApiPropertyOptional({ format: 'uuid' }) public avatarId?: string;
  @ApiPropertyOptional({ type: FileResponseDto })
  public avatar?: FileResponseDto;
  @ApiProperty({ format: 'date-time' }) public createdAt!: string;
  @ApiProperty({ description: 'Number of published posts' })
  public publicationCount!: number;
  @ApiProperty() public subscriberCount!: number;
}

export class PublicationResponseDto {
  @ApiProperty({ format: 'uuid' }) public id!: string;
  @ApiProperty({ format: 'uuid' }) public authorId!: string;
  @ApiProperty({ type: UserResponseDto }) public author!: UserResponseDto;
  @ApiProperty({ enum: PublicationType }) public type!: PublicationType;
  @ApiProperty({ enum: PublicationStatus }) public status!: PublicationStatus;
  @ApiProperty({ format: 'date-time' }) public createdAt!: string;
  @ApiProperty({ format: 'date-time' }) public publishedAt!: string;
  @ApiProperty({ type: [String] }) public tags!: string[];
  @ApiProperty() public likeCount!: number;
  @ApiProperty() public commentCount!: number;
  @ApiProperty() public isRepost!: boolean;
  @ApiPropertyOptional({ format: 'uuid' })
  public originalPublicationId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) public originalAuthorId?: string;
  @ApiPropertyOptional({ type: UserResponseDto })
  public originalAuthor?: UserResponseDto;
  @ApiPropertyOptional() public title?: string;
  @ApiPropertyOptional() public videoUrl?: string;
  @ApiPropertyOptional() public announcement?: string;
  @ApiPropertyOptional() public text?: string;
  @ApiPropertyOptional() public quoteAuthor?: string;
  @ApiPropertyOptional({ format: 'uuid' }) public photoId?: string;
  @ApiPropertyOptional({ type: FileResponseDto })
  public photo?: FileResponseDto;
  @ApiPropertyOptional() public linkUrl?: string;
  @ApiPropertyOptional() public description?: string;
}

export class CommentResponseDto {
  @ApiProperty({ format: 'uuid' }) public id!: string;
  @ApiProperty({ format: 'uuid' }) public publicationId!: string;
  @ApiProperty({ format: 'uuid' }) public authorId!: string;
  @ApiProperty({ type: UserResponseDto }) public author!: UserResponseDto;
  @ApiProperty() public text!: string;
  @ApiProperty({ format: 'date-time' }) public createdAt!: string;
}

export class LikeResponseDto {
  @ApiProperty({ format: 'uuid' }) public id!: string;
  @ApiProperty({ format: 'uuid' }) public publicationId!: string;
  @ApiProperty({ format: 'uuid' }) public userId!: string;
  @ApiProperty({ format: 'date-time' }) public createdAt!: string;
}

export class NotificationResponseDto {
  @ApiProperty() public recipientCount!: number;
  @ApiProperty() public publicationCount!: number;
}
