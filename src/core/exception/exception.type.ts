import { z } from 'zod';
import { ExceptionSchema } from './exceptios.schema';
import { HttpStatus } from '@nestjs/common';
import { Exception } from './exception';

export type ExceptionType = z.infer<typeof ExceptionSchema>;

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
