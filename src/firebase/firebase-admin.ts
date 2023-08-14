import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { DynamicModule, Logger, Module } from '@nestjs/common';
import {
  FirestoreThrottler,
  FirestoreThrottlerCollectionNameToken,
} from './firestore-throttler';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAdminApp } from './firebase-admin-app';
import { FirebaseAdminFirestore } from './firebase-admin-firestore';
import { FirebaseAdminAuth } from './firebase-admin-auth';
import { THROTTLER_OPTIONS } from '@nestjs/throttler/dist/throttler.constants';

export interface FirebaseAdminModuleOptions {
  throttlerFirestoreCollectionName?: string;
  throttlerTtl?: number;
  throttlerLimit?: number;
}

@Module({})
export class FirebaseAdminModule {
  static forRoot(options?: FirebaseAdminModuleOptions): DynamicModule {
    return {
      module: FirebaseAdminModule,
      imports: [ThrottlerModule],
      exports: [
        FirebaseAdminApp,
        FirebaseAdminFirestore,
        FirebaseAdminAuth,
        FirestoreThrottler,
      ],
      providers: [
        FirestoreThrottler,
        {
          provide: FirestoreThrottlerCollectionNameToken,
          useValue: options?.throttlerFirestoreCollectionName ?? 'rate-limit',
        },
        {
          provide: THROTTLER_OPTIONS,
          inject: [FirestoreThrottler],
          useFactory: (throttler: FirestoreThrottler) =>
            ({
              ttl: options?.throttlerTtl ?? 5,
              limit: options?.throttlerLimit ?? 30,
              storage: throttler,
            }) satisfies ThrottlerModuleOptions,
        },
        {
          provide: ThrottlerStorage,
          inject: [FirestoreThrottler],
          useFactory: (throttler: FirestoreThrottler) => throttler,
        },
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
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
    };
  }
}
