import { Inject, Injectable } from '@nestjs/common';
import { FirebaseAdminFirestore } from './firebase-admin-firestore';
import { Throttler, ThrottlerOptionsArgs } from '../core/throttler.token';
import { FirebaseFunctionsRateLimiter } from 'firebase-functions-rate-limiter';
import { safeAsync } from '../common/safe';
import { TOO_MANY_REQUESTS } from '../core/core-exceptions';

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
