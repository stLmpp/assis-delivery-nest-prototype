import { Injectable } from '@nestjs/common';
import { App } from 'firebase-admin/lib/app';

import { getClazz } from '../common/get-clazz';

@Injectable()
export class FirebaseAdminApp extends getClazz<App>() {}
