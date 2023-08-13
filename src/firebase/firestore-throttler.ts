import { Inject, Injectable } from '@nestjs/common';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { FirebaseAdminFirestore } from './firebase-admin';
import { ThrottlerStorageOptions } from '@nestjs/throttler/dist/throttler-storage-options.interface';
import {
  FirestoreDataConverter,
  WithFieldValue,
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference,
} from 'firebase-admin/firestore';
import { z } from 'zod';

export const FirestoreThrottlerCollectionNameToken =
  'FirestoreThrottlerCollectionNameToken';

@Injectable()
export class FirestoreThrottler {
  constructor(
    private readonly firebaseAdminFirestore: FirebaseAdminFirestore,
    @Inject(FirestoreThrottlerCollectionNameToken)
    private readonly collectionName: string,
  ) {}

  private readonly documentSchema = z
    .object({
      totalHits: z.number().catch(0),
      expiresAt: z.number().catch(() => Date.now() + 5_000),
    })
    .catch(() => ({
      totalHits: 0,
      expiresAt: Date.now() + 5_000,
    }));
  private readonly converter: FirestoreDataConverter<ThrottlerStorageOptions> =
    {
      toFirestore: (modelObject: WithFieldValue<unknown>): DocumentData =>
        this.documentSchema.parse(modelObject),
      fromFirestore: (
        snapshot: QueryDocumentSnapshot,
      ): ThrottlerStorageOptions => this.documentSchema.parse(snapshot),
    };

  private getCollection(): CollectionReference<ThrottlerStorageOptions> {
    return this.firebaseAdminFirestore
      .collection(this.collectionName)
      .withConverter(this.converter);
  }

  async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
    const ttlMs = ttl * 1000;
    const doc = this.getCollection().doc(key);
    const snapshot = await doc.get();
    let data: ThrottlerStorageOptions | undefined = snapshot.data();
    if (!data) {
      data = {
        totalHits: 0,
        expiresAt: Date.now() + ttlMs,
      };
      await doc.create(data);
    }
    let timeToExpire = Math.floor((data.expiresAt - Date.now()) / 1000);
    const update: Partial<ThrottlerStorageOptions> = {};
    if (timeToExpire <= 0) {
      update.expiresAt = Date.now() + ttlMs;
      timeToExpire = Math.floor((update.expiresAt - Date.now()) / 1000);
    }
    update.totalHits = data.totalHits + 1;
    await doc.update(update);
    return {
      totalHits: update.totalHits,
      timeToExpire,
    };
  }
}
