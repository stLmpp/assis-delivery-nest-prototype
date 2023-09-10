import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CitiesController } from './cities.controller';
import { CoreModule } from './core/core.module';
import { DrizzleOrmModule } from './database/drizzle-orm.module';
import { FirebaseAdminModule } from './firebase/firebase-admin';

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
