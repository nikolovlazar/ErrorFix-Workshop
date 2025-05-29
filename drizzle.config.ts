/**
 * FILE OVERVIEW:
 * Purpose: Configuration for Drizzle ORM migrations
 * Key Concepts: Drizzle ORM, Migrations, SQLite
 * Module Type: Configuration
 * @ai_context: This file configures Drizzle ORM's migration tools
 */

import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://readonly:r34d0nly_p4ssw0rd@ep-calm-haze-a4kr3yzk-pooler.us-east-1.aws.neon.tech/errorfix?sslmode=require';

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dbCredentials: {
    url: DATABASE_URL,
  },
});
