import { Inject, Injectable } from '@nestjs/common';
import { FirebaseFunctionsRateLimiter } from 'firebase-functions-rate-limiter';

import { safeAsync } from '../common/safe';
import { TOO_MANY_REQUESTS } from '../core/exception/core-exceptions';
import { Throttler } from '../core/throttler/throttler';
import { ThrottlerOptionsArgs } from '../core/throttler/throttler.type';

import { FirebaseAdminFirestore } from './firebase-admin-firestore';

export const FirestoreThrottlerCollectionNameToken =
  'FirestoreThrottlerCollectionNameToken';

@Injectable()
export class FirestoreThrottler extends Throttler {
  constructor(
    private readonly firebaseAdminFirestore: FirebaseAdminFirestore,
    @Inject(FirestoreThrottlerCollectionNameToken)
    private readonly collectionName: string,
  ) {
    super();
  }

  async rejectOnQuotaExceededOrRecordUsage({
    context,
    ttl,
    limit,
  }: ThrottlerOptionsArgs): Promise<void> {
    const rateLimiter = FirebaseFunctionsRateLimiter.withFirestoreBackend(
      {
        name: this.collectionName,
        maxCalls: limit,
        periodSeconds: ttl,
      },
      this.firebaseAdminFirestore,
    );
    const prefix = `${context.getClass().name}-${context.getHandler().name}`;
    const [error] = await safeAsync(() =>
      rateLimiter.rejectOnQuotaExceededOrRecordUsage(
        `${prefix}-${context.switchToHttp().getRequest().ip}`,
      ),
    );
    if (error) {
      throw TOO_MANY_REQUESTS();
    }
  }
}
