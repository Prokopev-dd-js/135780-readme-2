import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { GatewayAuthGuard } from './auth/gateway-auth.guard';
import { validateEnvironment } from './config/environment.validation';
import { GatewayModule } from './gateway.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/gateway/.env',
      validate: validateEnvironment,
    }),
    JwtModule.register({}),
    HealthModule,
    GatewayModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: GatewayAuthGuard }],
})
export class AppModule {}
