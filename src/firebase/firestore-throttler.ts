import { Inject, Injectable } from '@nestjs/common';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
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

const ThrottlerRecordSchema = z
  .object({
    expiresAt: z.number().catch(() => Date.now() + 5_000),
    hits: z.array(z.number()).catch([]),
  })
  .catch(() => ({
    hits: [],
    expiresAt: Date.now() + 5_000,
  }));

type ThrottlerRecord = z.infer<typeof ThrottlerRecordSchema>;

@Injectable()
export class FirestoreThrottler {
  constructor(
    private readonly firebaseAdminFirestore: FirebaseAdminFirestore,
    @Inject(FirestoreThrottlerCollectionNameToken)
    private readonly collectionName: string,
  ) {}

  private readonly documentSchema = ThrottlerRecordSchema;
  private readonly converter: FirestoreDataConverter<ThrottlerRecord> = {
    toFirestore: (modelObject: WithFieldValue<unknown>): DocumentData =>
      this.documentSchema.parse(modelObject),
    fromFirestore: (snapshot: QueryDocumentSnapshot): ThrottlerRecord =>
      this.documentSchema.parse(snapshot.data()),
  };

  private getCollection(): CollectionReference<ThrottlerRecord> {
    return this.firebaseAdminFirestore
      .collection(this.collectionName)
      .withConverter(this.converter);
  }

  private getTimeToExpire(expiresAt: number): number {
    return Math.floor((expiresAt - Date.now()) / 1000);
  }

  private getTimeToExpireMs(expiresAt: number): number {
    return expiresAt - Date.now();
  }

  async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
    // TODO fix throttler
    // Add one collection per key
    // Add one document per request
    // Count only the documents that are not expired
    // TODO add fix prototype
    const ttlMs = ttl * 1000;
    const doc = this.getCollection().doc(key);
    const snapshot = await doc.get();
    let data: ThrottlerRecord | undefined = snapshot.data();
    if (!data) {
      data = {
        expiresAt: Date.now() + ttlMs,
        hits: [],
      };
      await doc.create(data);
      return {
        totalHits: 0,
        timeToExpire: this.getTimeToExpire(data.expiresAt),
      };
    }
    const expiresAt = data.expiresAt;
    let timeToExpire = this.getTimeToExpire(expiresAt);
    const update: Partial<ThrottlerRecord> = {};
    if (timeToExpire <= 0) {
      update.expiresAt = Date.now() + ttlMs;
      timeToExpire = this.getTimeToExpire(update.expiresAt);
    }
    await doc.update({
      ...update,
      hits: [...data.hits, update.expiresAt ?? expiresAt],
    });
    const totalHits = data.hits.filter(
      (hit) => this.getTimeToExpireMs(hit) > 0,
    ).length;
    return {
      totalHits,
      timeToExpire,
    };
  }
}
