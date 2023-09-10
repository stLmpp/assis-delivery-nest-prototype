import { config } from 'dotenv';
import { Config } from 'drizzle-kit';

config();

export default {
  schema: './dist/schemas.js',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  driver: 'pg',
} satisfies Config;
