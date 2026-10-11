import { SetMetadata } from '@nestjs/common';

export const ROUTE_ACCESS = 'gateway:route-access';
export enum RouteAccess {
  Public = 'public',
  Anonymous = 'anonymous',
  Protected = 'protected',
}
export const Access = (access: RouteAccess) =>
  SetMetadata(ROUTE_ACCESS, access);
