import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { GatewayAuthGuard } from './gateway-auth.guard';
import { ROUTE_ACCESS, RouteAccess } from './route-access.decorator';

const secret = 'test-access-secret-at-least-32-characters';
const userId = '00000000-0000-4000-8000-000000000001';

function context(
  request: object,
  access: RouteAccess = RouteAccess.Protected,
): ExecutionContext {
  const handler = () => undefined;
  Reflect.defineMetadata(ROUTE_ACCESS, access, handler);
  return {
    getHandler: () => handler,
    getClass: () => Object,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

test('access token identity wins over an untrusted user header', async () => {
  const jwt = new JwtService();
  const guard = new GatewayAuthGuard(
    jwt,
    new ConfigService({ JWT_ACCESS_SECRET: secret }),
    new Reflector(),
  );
  const token = await jwt.signAsync(
    { sub: userId, email: 'reader@example.com', tokenType: 'access' },
    { secret, expiresIn: '1m' },
  );
  const request = {
    headers: { authorization: `Bearer ${token}`, 'x-user-id': 'spoofed' },
    user: undefined as unknown,
  };
  assert.equal(await guard.canActivate(context(request)), true);
  assert.equal((request.user as { sub: string }).sub, userId);
});

test('missing, expired and refresh tokens cannot access protected endpoints', async () => {
  const jwt = new JwtService();
  const guard = new GatewayAuthGuard(
    jwt,
    new ConfigService({ JWT_ACCESS_SECRET: secret }),
    new Reflector(),
  );
  await assert.rejects(
    guard.canActivate(context({ headers: {} })),
    UnauthorizedException,
  );
  for (const options of [
    { tokenType: 'refresh', expiresIn: 60 },
    { tokenType: 'access', expiresIn: -1 },
  ]) {
    const token = await jwt.signAsync(
      { sub: userId, tokenType: options.tokenType },
      { secret, expiresIn: options.expiresIn },
    );
    await assert.rejects(
      guard.canActivate(
        context({ headers: { authorization: `Bearer ${token}` } }),
      ),
      UnauthorizedException,
    );
  }
});

test('registration is anonymous only, while public reads permit anonymous users', async () => {
  const jwt = new JwtService();
  const guard = new GatewayAuthGuard(
    jwt,
    new ConfigService({ JWT_ACCESS_SECRET: secret }),
    new Reflector(),
  );
  assert.equal(
    await guard.canActivate(context({ headers: {} }, RouteAccess.Public)),
    true,
  );
  const token = await jwt.signAsync(
    { sub: userId, tokenType: 'access' },
    { secret },
  );
  await assert.rejects(
    guard.canActivate(
      context(
        { headers: { authorization: `Bearer ${token}` } },
        RouteAccess.Anonymous,
      ),
    ),
    ForbiddenException,
  );
});
