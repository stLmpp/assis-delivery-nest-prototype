import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CitiesController } from './cities.controller.js';
import { CoreModule } from './core/core.module.js';
import { DrizzleOrmModule } from './database/drizzle-orm.module.js';
import { FirebaseAdminModule } from './firebase/firebase-admin.js';

@Module({
  imports: [
    DrizzleOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connectionString: config.getOrThrow('DATABASE_URL'),
      }),
    }),
    CoreModule.forRoot(),
    FirebaseAdminModule.forRoot({
      throttlerLimit: 10,
    }),
  ],
  controllers: [CitiesController],
})
export class AppModule {}
