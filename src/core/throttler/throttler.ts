import type { ThrottlerOptionsArgs } from './throttler.type.js';

export abstract class Throttler {
  abstract rejectOnQuotaExceededOrRecordUsage(
    options: ThrottlerOptionsArgs,
  ): Promise<void>;
}
