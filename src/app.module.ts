import { Module } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { DrizzleOrmModule } from './database/drizzle-orm.module';
import { CoreModule } from './core/core.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DrizzleOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connectionString: config.getOrThrow('DATABASE_URL'),
      }),
    }),
    CoreModule.forRoot(),
  ],
  controllers: [CitiesController],
  providers: [],
})
export class AppModule {}
