import { INestApplication, Type, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import express, { Express } from 'express';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import helmet from 'helmet';
import { SwaggerUIOptions } from 'swagger-ui';

import { internalStateMiddleware } from './internal-state';
import { MainModule } from './main.module';

(BigInt.prototype as bigint & { toJSON(): number }).toJSON = function () {
  return Number(this);
};

let expressApp: Express | undefined;
let nestApp: INestApplication | undefined;

export interface CreateNestAppOptions {
  secrets?: Record<string, ReturnType<typeof defineSecret>>;
  module: Type;
}

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
    {
      logger,
    },
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
      requestInterceptor: (request) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        __request__interceptor(request),
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
