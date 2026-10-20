import {
  ArgumentsHost,
  Catch,
  ConflictException,
  NotFoundException,
  type HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

const DATABASE_ERROR = {
  Unique: 'P2002',
  ForeignKey: 'P2003',
  Missing: 'P2025',
  WriteConflict: 'P2034',
} as const;

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  public override catch(
    error: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    let exception: HttpException;
    switch (error.code) {
      case DATABASE_ERROR.Unique:
      case DATABASE_ERROR.WriteConflict:
        exception = new ConflictException(
          'Resource already exists or was changed concurrently',
        );
        break;
      case DATABASE_ERROR.ForeignKey:
      case DATABASE_ERROR.Missing:
        exception = new NotFoundException('Resource not found');
        break;
      default:
        super.catch(error, host);
        return;
    }
    host
      .switchToHttp()
      .getResponse<{ status(code: number): { json(body: unknown): void } }>()
      .status(exception.getStatus())
      .json(exception.getResponse());
  }
}
