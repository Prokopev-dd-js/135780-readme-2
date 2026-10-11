import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ minLength: 6, maxLength: 12 })
  @IsString()
  @Length(6, 12)
  public currentPassword!: string;

  @ApiProperty({ minLength: 6, maxLength: 12 })
  @IsString()
  @Length(6, 12)
  public newPassword!: string;
}
