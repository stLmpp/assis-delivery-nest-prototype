import { App, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

import { getClazz } from '../common/get-clazz';
import { DynamicModule, Injectable, Logger, Module } from '@nestjs/common';
import {
  FirestoreThrottler,
  FirestoreThrottlerCollectionNameToken,
} from './firestore-throttler';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Injectable()
export class FirebaseAdminAuth extends getClazz<Auth>() {}

@Injectable()
export class FirebaseAdminFirestore extends getClazz<Firestore>() {}

@Injectable()
export class FirebaseAdminApp extends getClazz<App>() {}

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
      imports: [
        ThrottlerModule.forRootAsync({
          inject: [FirestoreThrottler],
          useFactory: (throttler: FirestoreThrottler) => ({
            storage: throttler,
            ttl: options?.throttlerTtl ?? 5,
            limit: options?.throttlerLimit ?? 30,
          }),
        }),
      ],
      exports: [FirebaseAdminApp, FirebaseAdminFirestore, FirebaseAdminAuth],
      providers: [
        {
          provide: FirestoreThrottlerCollectionNameToken,
          useValue: options?.throttlerFirestoreCollectionName ?? 'rate-limit',
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
