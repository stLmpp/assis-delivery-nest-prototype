import { Injectable } from '@nestjs/common';
import { getClazz } from '../common/get-clazz';
import { Firestore } from 'firebase-admin/lib/firestore';

@Injectable()
export class FirebaseAdminFirestore extends getClazz<Firestore>() {}
