/**
 * FILE OVERVIEW:
 * Purpose: SERVER-ONLY database initialization and management
 * Key Concepts: SQLite, Drizzle ORM, Node.js
 * Module Type: Server Service
 * @ai_context: This module sets up database connections for server environments only
 */

import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { createClient } from '@libsql/client';
import { join } from 'path';

// Product type definition - shared with client
export type Product = {
  id: string | number;
  name: string;
  description: string;
  price: number;
  category: string;
  featured: boolean;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
};

/**
 * Initialize the server-side database
 * This is only used in API routes and Server Components
 */
export async function initDb() {
  try {
    console.log('🔄 Server: Initializing database');

    // Create SQLite database file path
    const dbPath = join(process.cwd(), 'sqlite.db');
    console.log(`SQLite database path: ${dbPath}`);

    // Initialize SQLite database connection
    const client = createClient({ url: 'file:./sqlite.db' });

    // Initialize Drizzle ORM
    const dbInstance = drizzle(client, { schema });
    console.log('✅ Server: Drizzle ORM initialized with schema');

    return { db: dbInstance };
  } catch (error) {
    console.error('❌ Server: Database initialization failed:', error);
    throw error;
  }
}

// Export schema for convenience
export { schema };
