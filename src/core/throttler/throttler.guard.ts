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
} from '@nestjs/throttler/dist/throttler.constants.js';

import { ThrottlerOptionsToken } from './throttler-options.token.js';
import { Throttler } from './throttler.js';
import type { ThrottlerOptions } from './throttler.type.js';

@Injectable()
export class ThrottlerGuard implements CanActivate {
  constructor(
    private readonly throttler: Throttler,
    private readonly reflector: Reflector,
    @Inject(ThrottlerOptionsToken) private readonly options: ThrottlerOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const classReference = context.getClass();

    // Return early if the current route should be skipped.
    if (
      this.reflector.getAllAndOverride<boolean>(THROTTLER_SKIP, [
        handler,
        classReference,
      ])
    ) {
      return true;
    }

    // Return early when we have no limit or ttl data.
    const limit = this.reflector.getAllAndOverride<number>(THROTTLER_LIMIT, [
      handler,
      classReference,
    ]);
    const ttl = this.reflector.getAllAndOverride<number>(THROTTLER_TTL, [
      handler,
      classReference,
    ]);

    await this.throttler.rejectOnQuotaExceededOrRecordUsage({
      ttl: ttl ?? this.options.ttl,
      limit: limit ?? this.options.limit,
      context,
    });
    return true;
  }
}
