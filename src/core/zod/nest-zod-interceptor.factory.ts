import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, switchMap } from 'rxjs';
import { Class } from 'type-fest';
import { ZodSchema } from 'zod';

import { formatZodErrorString } from '../../common/zod-error-formatter.js';
import { INVALID_RESPONSE } from '../exception/core-exceptions.js';

export function nestZodInterceptorFactory(
  schema: ZodSchema,
): Class<NestInterceptor> {
  @Injectable()
  class NestZodInterceptor implements NestInterceptor {
    intercept(
      _: ExecutionContext,
      next: CallHandler,
    ): Observable<any> | Promise<Observable<any>> {
      return next.handle().pipe(
        switchMap(async (data) => {
          const result = await schema.safeParseAsync(data);
          if (!result.success) {
            throw INVALID_RESPONSE(formatZodErrorString(result.error));
          }
          return result.data;
        }),
      );
    }
  }

  return NestZodInterceptor;
}
