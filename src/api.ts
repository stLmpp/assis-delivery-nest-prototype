import { AppModule } from './app.module';
import { createApi } from './core/create-api';

export const api = createApi(AppModule);
