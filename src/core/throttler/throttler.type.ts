import { ExecutionContext } from '@nestjs/common';

export interface ThrottlerOptions {
  limit: number;
  ttl: number;
}

export interface ThrottlerOptionsArgs extends ThrottlerOptions {
  context: ExecutionContext;
}
