/**
 * FILE OVERVIEW:
 * Purpose: SERVER-ONLY database initialization and management 
 * Key Concepts: PostgreSQL, Drizzle ORM, Node.js
 * Module Type: Server Service
 * @ai_context: This module sets up database connections for server environments only
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import { Pool } from 'pg';
import { products as importedProducts } from '@/lib/data';

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
 * Parse JSON safely from a string
 * This handles arrays stored as strings in the database
 */
export function safeJsonParse<T>(value: string | null | undefined | T): T {
  if (value === null || value === undefined) {
    return [] as unknown as T;
  }
  
  if (typeof value !== 'string') {
    return value;
  }
  
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    console.warn('Failed to parse JSON:', e);
    return [] as unknown as T;
  }
}

/**
 * Seed the database with products if it's empty
 */
async function seedProducts(dbInstance: any) {
  console.log('⏳ Server: Checking if products need to be seeded...');
  
  try {
    // Check if products table has any rows
    const result = await dbInstance.execute(sql`SELECT COUNT(*) as count FROM products`);
    const count = parseInt(result[0].count);
    console.log(`✅ Server: Found ${count} existing products`);
    
    if (count === 0) {
      console.log('🌱 Server: Seeding products table...');
      
      // Use imported products from data.ts
      const products = importedProducts;
      
      // Insert each product using SQL template literals
      for (const product of products) {
        // Convert array fields to JSON strings for storage
        await dbInstance.execute(sql`
          INSERT INTO products (
            id, name, description, price, category, featured, "inStock", rating, "reviewCount",
            images, sizes, colors
          ) VALUES (
            ${product.id}, 
            ${product.name}, 
            ${product.description}, 
            ${product.price}, 
            ${product.category}, 
            ${product.featured}, 
            ${product.inStock}, 
            ${product.rating}, 
            ${product.reviewCount},
            ${JSON.stringify(product.images)}, 
            ${JSON.stringify(product.sizes || [])}, 
            ${JSON.stringify(product.colors || [])}
          )
        `);
      }
      
      console.log(`✅ Server: Seeded ${products.length} products`);
    }
  } catch (error) {
    console.error('❌ Server: Error seeding products:', error);
    throw error;
  }
}

/**
 * Apply migrations to set up database schema
 */
async function applyMigrations(dbInstance: any) {
  try {
    // Import migrations directly
    const migrationsModule = await import('./migrations/export.json');
    const migrations = migrationsModule.default;
    
    // Check if migrations have the expected format
    if (Array.isArray(migrations)) {
      // Apply migrations manually using SQL
      for (const migration of migrations) {
        await dbInstance.execute(sql.raw(migration.sql || ''));
      }
      console.log('✅ Server: Applied migrations');
    } else {
      throw new Error('Invalid migrations format');
    }
    
    // Log created tables
    const tables = await dbInstance.execute(sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Server: Tables in database:', tables.map((row: any) => row.table_name));
  } catch (error) {
    console.error('❌ Server: Error applying migrations:', error);
    throw error;
  }
}

/**
 * Initialize the server-side database
 * This is only used in API routes and Server Components
 */
export async function initDb() {
  try {
    console.log('🔄 Server: Initializing database');
    
    // Get database connection string from environment variables
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Initialize PostgreSQL connection pool
    const pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    console.log('✅ Server: PostgreSQL connection pool initialized');
    
    // Initialize Drizzle ORM
    const dbInstance = drizzle(pgPool, { schema });
    console.log('✅ Server: Drizzle ORM initialized with schema');
    
    return { db: dbInstance, pg: pgPool };
  } catch (error) {
    console.error('❌ Server: Database initialization failed:', error);
    throw error;
  }
}

// Export schema for convenience
export { schema };
