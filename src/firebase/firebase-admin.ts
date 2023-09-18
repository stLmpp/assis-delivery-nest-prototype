import { DynamicModule, Logger, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import { ThrottlerOptionsToken } from '../core/throttler/throttler-options.token.js';
import { ThrottlerGuard } from '../core/throttler/throttler.guard.js';
import { Throttler } from '../core/throttler/throttler.js';
import { ThrottlerOptions } from '../core/throttler/throttler.type.js';

import { FirebaseAdminApp } from './firebase-admin-app.js';
import { FirebaseAdminAuth } from './firebase-admin-auth.js';
import { FirebaseAdminFirestore } from './firebase-admin-firestore.js';
import {
  FirebaseAdminAsyncOptionsType,
  FirebaseAdminBaseClass,
  FirebaseAdminModuleOptions,
  FirebaseAdminOptionsToken,
  FirebaseAdminOptionsType,
} from './firebase-admin.config.js';
import {
  FirestoreThrottler,
  FirestoreThrottlerCollectionNameToken,
} from './firestore-throttler.js';

@Module({
  exports: [FirebaseAdminApp, FirebaseAdminFirestore, FirebaseAdminAuth],
  providers: [
    {
      provide: ThrottlerOptionsToken,
      useFactory: (options: FirebaseAdminModuleOptions) =>
        ({
          ttl: options.throttlerTtl ?? 5,
          limit: options.throttlerLimit ?? 10,
        }) satisfies ThrottlerOptions,
      inject: [FirebaseAdminOptionsToken],
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: Throttler,
      useClass: FirestoreThrottler,
    },
    {
      provide: FirestoreThrottlerCollectionNameToken,
      useFactory: (options: FirebaseAdminModuleOptions) =>
        options?.throttlerFirestoreCollectionName ?? 'rate-limit',
      inject: [FirebaseAdminOptionsToken],
    },
    { provide: FirebaseAdminApp, useFactory: () => initializeApp() },
    {
      provide: FirebaseAdminAuth,
      useFactory: (app: FirebaseAdminApp) => getAuth(app),
      inject: [FirebaseAdminApp],
    },
    {
      provide: FirebaseAdminFirestore,
      useFactory: (app: FirebaseAdminApp) => {
        const firestore = getFirestore(app);
        try {
          firestore.settings({ ignoreUndefinedProperties: true });
        } catch {
          Logger.warn('Could not set firestore settings');
          // Ignore
        }
        return firestore;
      },
      inject: [FirebaseAdminApp],
    },
  ],
})
export class FirebaseAdminModule extends FirebaseAdminBaseClass {
  static forRoot(options: FirebaseAdminOptionsType = {}): DynamicModule {
    return {
      ...super.forRoot(options),
    };
  }

  static forRootAsync(options: FirebaseAdminAsyncOptionsType): DynamicModule {
    return {
      ...super.forRootAsync(options),
    };
  }
}
