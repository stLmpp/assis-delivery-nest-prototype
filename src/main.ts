import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import { internalStateMiddleware } from './core/internal-state';
import helmet from 'helmet';
import compression from 'compression';
import { https } from 'firebase-functions/v2';
import express, { Express } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

let expressApp: Express | null = null;

async function createNestApp(): Promise<Express> {
  if (expressApp) {
    return expressApp;
  }
  expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  app
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
    })
    .enableCors();
  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0.0')
    .addServer(
      'http://127.0.0.1:5001/assis-delivery-prototype/us-central1/api/',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config, {});
  SwaggerModule.setup('help', app, document, {
    swaggerOptions: {
      displayRequestDuration: true,
    },
  });
  await app.init();
  // Logger.log('Application running on http://localhost:3000/', 'Core');
  // Logger.log('Swagger running on http://localhost:3000/help/', 'Core');
  return expressApp;
}

export const api = https.onRequest({}, async (request, response) => {
  const app = await createNestApp();
  app(request, response);
});
