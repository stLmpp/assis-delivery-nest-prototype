import { HttpException, HttpStatus } from '@nestjs/common';
import { getReasonPhrase } from 'http-status-codes';
import { SetOptional } from 'type-fest';
import { getCorrelationId } from '../internal-state';
import { safe } from '../../common/safe';
import {
  ExceptionArgs,
  ExceptionFactory,
  ExceptionFactoryWithError,
  ExceptionFactoryWithoutError,
  ExceptionType,
} from './exception.type';

function getCorrelationIdWithDefault() {
  const [, correlationId] = safe(() => getCorrelationId());
  return correlationId ?? '';
}

export class Exception extends HttpException {
  constructor(
    status: HttpStatus,
    public readonly message: string,
    public readonly errorCode: string,
    public readonly error: string,
    public readonly description?: string,
    correlationId = getCorrelationIdWithDefault(),
  ) {
    super(
      {
        status,
        message,
        errorCode,
        error,
        correlationId,
      },
      status,
    );
    this.name = 'Exception';
    this.correlationId = correlationId;
  }

  correlationId: string;

  toJSON(): ExceptionType {
    return {
      correlationId: this.correlationId,
      error: this.error,
      errorCode: this.errorCode,
      message: this.message,
      status: this.getStatus(),
    };
  }
}

export function exception(args: ExceptionArgs): ExceptionFactoryWithoutError;
export function exception(
  args: SetOptional<ExceptionArgs, 'error'>,
): ExceptionFactoryWithError;
export function exception(
  args: SetOptional<ExceptionArgs, 'error'>,
): ExceptionFactory {
  return (error) =>
    new Exception(
      args.status,
      args.message ?? getReasonPhrase(args.status),
      args.errorCode,
      args.error ?? error ?? getReasonPhrase(args.status),
      args.description,
    );
}
