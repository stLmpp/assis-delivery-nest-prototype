import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, VersioningType } from '@nestjs/common';
import { internalStateMiddleware } from './core/internal-state';
import helmet from 'helmet';
import compression from 'compression';
import express, { Express } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerUIOptions } from 'swagger-ui';

(BigInt.prototype as bigint & { toJSON(): number }).toJSON = function () {
  return Number(this);
};

let expressApp: Express | null = null;
let nestApp: INestApplication | null = null;

export async function createNestApp(): Promise<[Express, INestApplication]> {
  if (expressApp && nestApp) {
    return [expressApp, nestApp];
  }
  // TODO move to CORE
  expressApp = express();
  nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
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
  if (DEV_MODE) {
    nestApp.enableCors();
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
  }

  await nestApp.init();
  return [expressApp, nestApp];
}
