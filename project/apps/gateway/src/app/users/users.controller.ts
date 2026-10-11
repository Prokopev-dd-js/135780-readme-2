import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import {
  AuthTokensRdo,
  ChangePasswordDto,
  CreateUserDto,
  LoginUserDto,
} from '@project/shared-api';
import { Access, RouteAccess } from '../auth/route-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { BackendClient, BackendService } from '../backend/backend-client';
import { ApiBackendResponses } from '../backend/api-backend-responses.decorator';
import {
  PresentationService,
  type UserData,
  type UserView,
} from '../presentation/presentation.service';
import { UserResponseDto } from '../presentation/response.dto';

@ApiTags('users')
@ApiBackendResponses()
@Controller('users')
export class UsersController {
  public constructor(
    private readonly backend: BackendClient,
    private readonly presentation: PresentationService,
  ) {}

  @Post('register')
  @Access(RouteAccess.Anonymous)
  @ApiOperation({ summary: 'Register an anonymous user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  public async register(@Body() dto: CreateUserDto): Promise<UserView> {
    if (dto.avatarId) {
      await this.backend.request(
        BackendService.File,
        'GET',
        `/files/avatars/${dto.avatarId}`,
      );
    }
    const user = await this.backend.request<UserData>(
      BackendService.Account,
      'POST',
      '/users/register',
      { body: dto },
    );
    return this.presentation.userView(user);
  }

  @Post('login')
  @Access(RouteAccess.Public)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and obtain access and refresh tokens' })
  @ApiOkResponse({ type: AuthTokensRdo })
  public login(@Body() dto: LoginUserDto): Promise<AuthTokensRdo> {
    return this.backend.request(
      BackendService.Account,
      'POST',
      '/users/login',
      { body: dto },
    );
  }

  @Patch('password')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change the current user password' })
  @ApiNoContentResponse({ description: 'Password changed' })
  public async changePassword(
    @CurrentUser() userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.backend.request(
      BackendService.Account,
      'PATCH',
      '/users/password',
      { body: dto, userId },
    );
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  public me(@CurrentUser() userId: string): Promise<UserView> {
    return this.presentation.user(userId);
  }

  @Get(':id')
  @Access(RouteAccess.Public)
  @ApiOperation({
    summary: 'Get a user profile with avatar and publication count',
  })
  @ApiOkResponse({ type: UserResponseDto })
  public get(@Param('id', ParseUUIDPipe) id: string): Promise<UserView> {
    return this.presentation.user(id);
  }
}
