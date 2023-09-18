import { Type } from '@nestjs/common';
import { defineSecret } from 'firebase-functions/params';
import { https } from 'firebase-functions/v2';

import { createNestApp } from './create-nest-app.js';

const DATABASE_URL = defineSecret('DATABASE_URL');

export function createApi(module: Type) {
  return https.onRequest(
    {
      secrets: [DATABASE_URL],
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
        module,
      });
      app(request, response);
    },
  );
}
