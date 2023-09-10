import { Injectable } from '@nestjs/common';
import { Firestore } from 'firebase-admin/lib/firestore';

import { getClazz } from '../common/get-clazz';

@Injectable()
export class FirebaseAdminFirestore extends getClazz<Firestore>() {}
