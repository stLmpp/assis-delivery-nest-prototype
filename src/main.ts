import { createNestApp } from './create-nest-app';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

(async () => {
  const [, app] = await createNestApp({
    module: AppModule,
  });
  await app.listen(3000);
  Logger.log('Swagger running on http://localhost:3000/', 'Core');
})();
