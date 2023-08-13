import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Exception } from './exception';
import {
  ROUTE_NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNKNOWN_INTERNAL_SERVER_ERROR,
} from './core-exceptions';
import { ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(unknownException: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const context = host.switchToHttp();

    let exception: Exception;

    if (
      unknownException instanceof NotFoundException &&
      unknownException.message.startsWith('Cannot')
    ) {
      exception = ROUTE_NOT_FOUND(
        `Route not found: ${context.getRequest<Request>().path}`,
      );
    } else if (unknownException instanceof ThrottlerException) {
      exception = TOO_MANY_REQUESTS();
    } else if (unknownException instanceof Exception) {
      exception = unknownException;
    } else {
      Logger.error(
        `An unknown error occurred. Error: "${unknownException}". Details: ${JSON.stringify(
          unknownException,
        )}`,
      );
      exception = UNKNOWN_INTERNAL_SERVER_ERROR();
    }

    httpAdapter.reply(
      context.getResponse(),
      exception.toJSON(),
      exception.getStatus(),
    );
  }
}
