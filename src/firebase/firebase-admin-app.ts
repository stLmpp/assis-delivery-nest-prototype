import { Injectable } from '@nestjs/common';
import { getClazz } from '../common/get-clazz';
import { App } from 'firebase-admin/lib/app';

@Injectable()
export class FirebaseAdminApp extends getClazz<App>() {}
