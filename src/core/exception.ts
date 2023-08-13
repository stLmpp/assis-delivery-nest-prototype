import { HttpException, HttpStatus } from '@nestjs/common';
import { z } from 'zod';
import { ApiResponse } from '@nestjs/swagger';
import { generateSchema } from '../common/generate-schema';
import { arrayUniqBy } from '../common/array-uniq-by';
import { ExamplesObject } from 'openapi3-ts/oas31';
import { getReasonPhrase } from 'http-status-codes';
import { randomUUID } from 'node:crypto';
import { SetOptional } from 'type-fest';
import { getCorrelationId } from './internal-state';
import { safe } from '../common/safe';

export const ExceptionSchema = z.object({
  status: z.number(),
  message: z.string(),
  error: z.string(),
  errorCode: z.string(),
  correlationId: z.string().uuid(),
});

export type ExceptionType = z.infer<typeof ExceptionSchema>;

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

export interface ExceptionArgs {
  errorCode: string;
  error: string;
  message?: string;
  status: HttpStatus;
  description?: string;
}

export interface ExceptionFactoryWithoutError {
  (): Exception;
}
export interface ExceptionFactoryWithError {
  (error: string): Exception;
}
export type ExceptionFactory =
  | ExceptionFactoryWithoutError
  | ExceptionFactoryWithError;

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

const CORRELATION_ID_EXAMPLE = randomUUID();

export function Exceptions(factories: ExceptionFactory[]): MethodDecorator {
  const exceptions = factories.map((exception) => exception(''));
  return (target, propertyKey, descriptor) => {
    const statusList = arrayUniqBy(exceptions, (exception) =>
      exception.getStatus(),
    ).map((exception) => exception.getStatus());
    for (const status of statusList) {
      const exceptionsStatus = exceptions.filter(
        (exception) => exception.getStatus() === status,
      );
      const examples: ExamplesObject = {};
      for (const exception of exceptionsStatus) {
        examples[exception.errorCode] = {
          value: {
            ...exception.toJSON(),
            correlationId: CORRELATION_ID_EXAMPLE,
          },
        };
      }
      ApiResponse({
        status,
        content: {
          'application/json': {
            schema: generateSchema(ExceptionSchema),
            examples,
          },
        },
        description: getReasonPhrase(status),
      })(target, propertyKey, descriptor);
    }
  };
}
