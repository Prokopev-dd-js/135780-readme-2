import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined => {
    return context.switchToHttp().getRequest<{ user?: { sub: string } }>().user
      ?.sub;
  },
);
