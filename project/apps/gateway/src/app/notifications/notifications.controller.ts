import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BackendClient, BackendService } from '../backend/backend-client';
import { ApiBackendResponses } from '../backend/api-backend-responses.decorator';
import { NotificationResponseDto } from '../presentation/response.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@ApiBackendResponses()
@Controller('notifications')
export class NotificationsController {
  public constructor(private readonly backend: BackendClient) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger delivery of new-publication email notifications',
  })
  @ApiOkResponse({ type: NotificationResponseDto })
  public send(): Promise<NotificationResponseDto> {
    return this.backend.request(
      BackendService.Notification,
      'POST',
      '/notifications/send',
    );
  }
}
