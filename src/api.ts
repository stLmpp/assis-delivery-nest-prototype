import { defineSecret } from 'firebase-functions/params';
import { https } from 'firebase-functions/v2';

import { AppModule } from './app.module';
import { createNestApp } from './core/create-nest-app';

const DATABASE_URL = defineSecret('DATABASE_URL');

export const api = https.onRequest(
  {
    secrets: [DATABASE_URL],
    // TODO figure out a way to configure this in the build process (github action)
    timeoutSeconds: 20,
    cpu: 1,
    region: 'us-east1',
    minInstances: 0,
    maxInstances: 2,
    concurrency: 50,
    memory: '256MiB',
  },
  async (request, response) => {
    const [app] = await createNestApp({
      secrets: {
        DATABASE_URL,
      },
      module: AppModule,
    });
    app(request, response);
  },
);
