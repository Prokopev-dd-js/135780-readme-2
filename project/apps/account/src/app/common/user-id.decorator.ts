import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): unknown => {
    return context
      .switchToHttp()
      .getRequest<{ headers: Record<string, unknown> }>().headers['x-user-id'];
  },
);
