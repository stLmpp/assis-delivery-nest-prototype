import { Injectable } from '@nestjs/common';
import { Auth } from 'firebase-admin/lib/auth';

import { getClazz } from '../common/get-clazz';

@Injectable()
export class FirebaseAdminAuth extends getClazz<Auth>() {}
