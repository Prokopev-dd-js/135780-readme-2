import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiBackendResponses } from '../backend/api-backend-responses.decorator';
import { SubscriptionResponseDto } from '../presentation/response.dto';
import {
  SubscriptionsGatewayService,
  type SubscriptionView,
} from './subscriptions.service';

@ApiTags('subscriptions')
@ApiBearerAuth()
@ApiBackendResponses()
@Controller('subscriptions')
export class SubscriptionsController {
  public constructor(private readonly service: SubscriptionsGatewayService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current user subscriptions with author profiles',
  })
  @ApiOkResponse({ type: [SubscriptionResponseDto] })
  public find(@CurrentUser() userId: string): Promise<SubscriptionView[]> {
    return this.service.find(userId);
  }

  @Post(':authorId')
  @ApiOperation({ summary: 'Subscribe to another user' })
  @ApiCreatedResponse({ type: SubscriptionResponseDto })
  public subscribe(
    @CurrentUser() userId: string,
    @Param('authorId', ParseUUIDPipe) authorId: string,
  ): Promise<SubscriptionView> {
    return this.service.subscribe(userId, authorId);
  }

  @Delete(':authorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unsubscribe from a user' })
  @ApiNoContentResponse({ description: 'Subscription removed' })
  public unsubscribe(
    @CurrentUser() userId: string,
    @Param('authorId', ParseUUIDPipe) authorId: string,
  ): Promise<void> {
    return this.service.unsubscribe(userId, authorId);
  }
}
