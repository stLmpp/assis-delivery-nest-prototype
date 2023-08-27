import { https } from 'firebase-functions/v2';
import { createNestApp } from './create-nest-app';

export const api = https.onRequest({}, async (request, response) => {
  const [app] = await createNestApp();
  app(request, response);
});
