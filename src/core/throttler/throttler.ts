import { ThrottlerOptionsArgs } from './throttler.type';

export abstract class Throttler {
  abstract rejectOnQuotaExceededOrRecordUsage(
    options: ThrottlerOptionsArgs,
  ): Promise<void>;
}
