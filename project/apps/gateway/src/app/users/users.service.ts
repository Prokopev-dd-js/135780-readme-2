import { Injectable } from '@nestjs/common';
import {
  AuthTokensRdo,
  ChangePasswordDto,
  CreateUserDto,
  LoginUserDto,
} from '@project/shared-api';
import { BackendClient, BackendService } from '../backend/backend-client';
import {
  PresentationService,
  type UserData,
  type UserView,
} from '../presentation/presentation.service';

@Injectable()
export class UsersGatewayService {
  public constructor(
    private readonly backend: BackendClient,
    private readonly presentation: PresentationService,
  ) {}

  public async register(dto: CreateUserDto): Promise<UserView> {
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
    return this.presentation.createUserView(user);
  }

  public login(dto: LoginUserDto): Promise<AuthTokensRdo> {
    return this.backend.request(
      BackendService.Account,
      'POST',
      '/users/login',
      { body: dto },
    );
  }

  public async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    await this.backend.request(
      BackendService.Account,
      'PATCH',
      '/users/password',
      { body: dto, userId },
    );
  }

  public getById(userId: string): Promise<UserView> {
    return this.presentation.getUser(userId);
  }
}
