import { defineSecret } from 'firebase-functions/params';
import { https } from 'firebase-functions/v2';

import { AppModule } from './app.module';
import { createNestApp } from './core/create-nest-app';

const DATABASE_URL = defineSecret('DATABASE_URL');

export const api = https.onRequest(
  {
    secrets: [DATABASE_URL],
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
