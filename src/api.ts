import { AppModule } from './app.module.js';
import { createApi } from './core/create-api.js';

export const api = createApi(AppModule);
