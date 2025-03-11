/**
 * FILE OVERVIEW:
 * Purpose: Configuration for Drizzle ORM migrations
 * Key Concepts: Drizzle ORM, Migrations, SQLite
 * Module Type: Configuration
 * @ai_context: This file configures Drizzle ORM's migration tools
 */

import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  dialect: 'sqlite',
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dbCredentials: {
    url: `file:./sqlite.db`,
  },
  verbose: true,
  strict: true,
});
