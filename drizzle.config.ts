import { Config } from 'drizzle-kit';

import { config } from 'dotenv';

config();

export default {
  schema: './dist/schemas.js',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  driver: 'pg',
} satisfies Config;
