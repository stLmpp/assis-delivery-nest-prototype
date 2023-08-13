import { ZodSchema } from 'zod';
import { Class } from 'type-fest';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, switchMap } from 'rxjs';

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
            // TODO add custom error
            throw new InternalServerErrorException();
          }
          return result.data;
        }),
      );
    }
  }

  return NestZodInterceptor;
}
