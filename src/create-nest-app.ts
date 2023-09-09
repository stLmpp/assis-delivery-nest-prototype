import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  DynamicModule,
  INestApplication,
  Module,
  Type,
  VersioningType,
} from '@nestjs/common';
import { internalStateMiddleware } from './core/internal-state';
import helmet from 'helmet';
import compression from 'compression';
import express, { Express } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerUIOptions } from 'swagger-ui';
import { defineSecret } from 'firebase-functions/params';
import { ConfigModule } from '@nestjs/config';

(BigInt.prototype as bigint & { toJSON(): number }).toJSON = function () {
  return Number(this);
};

let expressApp: Express | null = null;
let nestApp: INestApplication | null = null;

export interface CreateNestAppOptions {
  secrets?: Record<string, ReturnType<typeof defineSecret>>;
  module: Type;
}

// TODO MOVE TO CORE
@Module({})
class MainModule {
  static create(options: {
    // TODO create type
    secrets: Record<string, string>;
    module: Type;
  }): DynamicModule {
    return {
      module: MainModule,
      imports: [
        ConfigModule.forRoot({
          load: [() => options.secrets],
        }),
        options.module,
      ],
    };
  }
}

// TODO move to CORE
export async function createNestApp(
  options: CreateNestAppOptions,
): Promise<[Express, INestApplication]> {
  if (expressApp && nestApp) {
    return [expressApp, nestApp];
  }
  expressApp = express();
  nestApp = await NestFactory.create(
    MainModule.create({
      secrets: Object.fromEntries(
        Object.entries(options.secrets ?? {}).map(([secretName, secret]) => [
          secretName,
          secret.value(),
        ]), // TODO extract into a function
      ),
      module: options.module,
    }),
    new ExpressAdapter(expressApp),
  );

  nestApp
    .use(
      internalStateMiddleware(),
      helmet({
        contentSecurityPolicy: false,
      }),
      compression(),
    )
    .enableVersioning({
      type: VersioningType.URI,
      prefix: 'v',
    });
  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(nestApp, config, {});
  SwaggerModule.setup('help', nestApp, document, {
    swaggerOptions: {
      displayRequestDuration: true,
      requestInterceptor: (request) => {
        // @ts-expect-error
        return __request__interceptor(request);
      },
    } satisfies SwaggerUIOptions,
    customJsStr: `window.__request__interceptor = (request) => {
        const url = new URL(request.url);
        const endPoint = url.pathname;
        const origin = location.origin;
        const path = location.pathname.replace(/\\/help$/, '');
        request.url = origin + path + endPoint;
        return request;
      }`,
  });
  if (DEV_MODE) {
    nestApp.enableCors();
  }

  await nestApp.init();
  return [expressApp, nestApp];
}
