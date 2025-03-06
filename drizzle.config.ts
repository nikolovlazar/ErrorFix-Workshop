/**
 * FILE OVERVIEW:
 * Purpose: Configuration for Drizzle ORM migrations
 * Key Concepts: Drizzle ORM, Migrations, PostgreSQL
 * Module Type: Configuration
 * @ai_context: This file configures Drizzle ORM's migration tools
 */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  driver: 'pglite',
  verbose: true,
  strict: true,
});
