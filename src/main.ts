import { createNestApp } from './create-nest-app';
import { Logger } from '@nestjs/common';

(async () => {
  const [, app] = await createNestApp();
  await app.listen(3000);
  Logger.log('Swagger running on http://localhost:3000/', 'Core');
})();
