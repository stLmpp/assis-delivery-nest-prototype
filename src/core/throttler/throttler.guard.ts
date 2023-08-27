import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  THROTTLER_LIMIT,
  THROTTLER_SKIP,
  THROTTLER_TTL,
} from '@nestjs/throttler/dist/throttler.constants';
import { ThrottlerOptions } from './throttler.type';
import { Throttler } from './throttler';
import { ThrottlerOptionsToken } from './throttler-options.token';

@Injectable()
export class ThrottlerGuard implements CanActivate {
  constructor(
    private readonly throttler: Throttler,
    private readonly reflector: Reflector,
    @Inject(ThrottlerOptionsToken) private readonly options: ThrottlerOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const classRef = context.getClass();

    // Return early if the current route should be skipped.
    if (
      this.reflector.getAllAndOverride<boolean>(THROTTLER_SKIP, [
        handler,
        classRef,
      ])
    ) {
      return true;
    }

    // Return early when we have no limit or ttl data.
    const limit = this.reflector.getAllAndOverride<number>(THROTTLER_LIMIT, [
      handler,
      classRef,
    ]);
    const ttl = this.reflector.getAllAndOverride<number>(THROTTLER_TTL, [
      handler,
      classRef,
    ]);

    await this.throttler.rejectOnQuotaExceededOrRecordUsage({
      ttl: ttl ?? this.options.ttl,
      limit: limit ?? this.options.limit,
      context,
    });
    return true;
  }
}
