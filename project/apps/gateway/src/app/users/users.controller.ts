import { UsersGatewayService } from './users.service';
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
import { ApiBackendResponses } from '../backend/api-backend-responses.decorator';
import { type UserView } from '../presentation/presentation.service';
import { UserResponseDto } from '../presentation/response.dto';

@ApiTags('users')
@ApiBackendResponses()
@Controller('users')
export class UsersController {
  public constructor(private readonly service: UsersGatewayService) {}

  @Post('register')
  @Access(RouteAccess.Anonymous)
  @ApiOperation({ summary: 'Register an anonymous user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  public async register(@Body() dto: CreateUserDto): Promise<UserView> {
    return this.service.register(dto);
  }

  @Post('login')
  @Access(RouteAccess.Public)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and obtain access and refresh tokens' })
  @ApiOkResponse({ type: AuthTokensRdo })
  public login(@Body() dto: LoginUserDto): Promise<AuthTokensRdo> {
    return this.service.login(dto);
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
    return this.service.changePassword(userId, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  public me(@CurrentUser() userId: string): Promise<UserView> {
    return this.service.getById(userId);
  }

  @Get(':id')
  @Access(RouteAccess.Public)
  @ApiOperation({
    summary: 'Get a user profile with avatar and publication count',
  })
  @ApiOkResponse({ type: UserResponseDto })
  public get(@Param('id', ParseUUIDPipe) id: string): Promise<UserView> {
    return this.service.getById(id);
  }
}
