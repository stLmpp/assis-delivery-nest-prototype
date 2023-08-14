import { Injectable } from '@nestjs/common';
import { getClazz } from '../common/get-clazz';
import { Auth } from 'firebase-admin/lib/auth';

@Injectable()
export class FirebaseAdminAuth extends getClazz<Auth>() {}
