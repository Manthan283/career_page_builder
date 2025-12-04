import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // where your schema is
  schema: 'prisma/schema.prisma',

  // where migrations should be stored
  migrations: { path: 'prisma/migrations' },

  // move the connection URL out of schema.prisma into the config
  datasource: {
    url: env('DATABASE_URL'),
  },
});
