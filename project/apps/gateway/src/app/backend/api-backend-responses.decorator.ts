import { applyDecorators } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiGatewayTimeoutResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const ApiBackendResponses = () =>
  applyDecorators(
    ApiBadRequestResponse({ description: 'Input validation failed' }),
    ApiUnauthorizedResponse({
      description: 'Access token or credentials are invalid',
    }),
    ApiForbiddenResponse({ description: 'Operation is not permitted' }),
    ApiNotFoundResponse({ description: 'Resource not found' }),
    ApiConflictResponse({
      description: 'Resource state conflicts with the operation',
    }),
    ApiBadGatewayResponse({ description: 'A backend service is unavailable' }),
    ApiGatewayTimeoutResponse({
      description: 'A backend service did not respond in time',
    }),
  );
