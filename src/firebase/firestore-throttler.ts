import { Inject, Injectable } from '@nestjs/common';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { ThrottlerStorageOptions } from '@nestjs/throttler/dist/throttler-storage-options.interface';
import {
  CollectionReference,
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  WithFieldValue,
} from 'firebase-admin/firestore';
import { z } from 'zod';
import { FirebaseAdminFirestore } from './firebase-admin-firestore';

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
      ): ThrottlerStorageOptions => this.documentSchema.parse(snapshot.data()),
    };

  private getCollection(): CollectionReference<ThrottlerStorageOptions> {
    return this.firebaseAdminFirestore
      .collection(this.collectionName)
      .withConverter(this.converter);
  }

  private getTimeToExpire(expiresAt: number): number {
    return Math.floor((expiresAt - Date.now()) / 1000);
  }

  async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
    // TODO fix throttler
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
      return {
        totalHits: data.totalHits,
        timeToExpire: this.getTimeToExpire(data.expiresAt),
      };
    }
    let timeToExpire = this.getTimeToExpire(data.expiresAt);
    const update: Partial<ThrottlerStorageOptions> = {};
    if (timeToExpire <= 0) {
      update.expiresAt = Date.now() + ttlMs;
      timeToExpire = this.getTimeToExpire(update.expiresAt);
    }
    update.totalHits = data.totalHits + 1;
    await doc.update(update);
    return {
      totalHits: update.totalHits ?? data.totalHits,
      timeToExpire,
    };
  }
}
