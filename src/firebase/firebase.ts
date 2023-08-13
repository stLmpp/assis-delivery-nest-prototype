import {
  FirebaseApp as FirebaseAppInterface,
  FirebaseOptions,
  initializeApp,
} from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { getClazz } from '../common/get-clazz';
import { DynamicModule, Injectable, Module } from '@nestjs/common';

@Injectable()
export class FirebaseAuth extends getClazz<Auth>() {}

@Injectable()
export class FirebaseApp extends getClazz<FirebaseAppInterface>() {}

@Module({})
export class FirebaseModule {
  static forRoot(options?: FirebaseOptions): DynamicModule {
    return {
      module: FirebaseModule,
      exports: [FirebaseApp, FirebaseAuth],
      providers: [
        {
          provide: FirebaseApp,
          useFactory: () => {
            return initializeApp(options ?? {});
          },
        },
        {
          provide: FirebaseAuth,
          useFactory: (app: FirebaseApp) => {
            const auth = getAuth(app);
            // TODO add DEV_MODE
            connectAuthEmulator(auth, 'http://127.0.0.1:9099');
            return auth;
          },
        },
      ],
    };
  }
}
