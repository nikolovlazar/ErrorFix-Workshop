/**
 * FILE OVERVIEW:
 * Purpose: SERVER-ONLY database initialization and management 
 * Key Concepts: SQLite, Drizzle ORM, Node.js
 * Module Type: Server Service
 * @ai_context: This module sets up database connections for server environments only
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import Database from 'better-sqlite3';
import { join } from 'path';
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
    const result = dbInstance.select({ count: sql`count(*)` }).from(schema.products).all();
    const count = parseInt(result[0]?.count?.toString() || '0');
    console.log(`✅ Server: Found ${count} existing products`);
    
    if (count === 0) {
      console.log('🌱 Server: Seeding products table...');
      
      // Use imported products from data.ts
      const products = importedProducts;
      
      // Insert each product
      for (const product of products) {
        // Insert products with proper JSON conversion
        dbInstance.insert(schema.products).values({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          featured: product.featured,
          inStock: product.inStock,
          rating: product.rating,
          reviewCount: product.reviewCount,
          images: JSON.stringify(product.images),
          sizes: JSON.stringify(product.sizes || []),
          colors: JSON.stringify(product.colors || [])
        }).run();
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
async function applyMigrations(dbInstance: any, sqliteDB: any) {
  try {
    // Create tables manually using schema definition
    const sqlSchema = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        featured INTEGER NOT NULL DEFAULT 0,
        in_stock INTEGER NOT NULL DEFAULT 1,
        rating REAL,
        review_count INTEGER DEFAULT 0,
        images TEXT NOT NULL DEFAULT '[]',
        sizes TEXT NOT NULL DEFAULT '[]',
        colors TEXT NOT NULL DEFAULT '[]'
      );
      
      CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
      
      CREATE TABLE IF NOT EXISTS product_sizes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        size TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
      
      CREATE TABLE IF NOT EXISTS product_colors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        color TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `;
    
    // Execute the schema creation
    sqliteDB.exec(sqlSchema);
    console.log('✅ Server: Applied migrations');
    
    // Log created tables
    const tables = sqliteDB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📊 Server: Tables in database:', tables.map((row: any) => row.name));
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
    
    // Create SQLite database file path
    const dbPath = join(process.cwd(), 'sqlite.db');
    console.log(`SQLite database path: ${dbPath}`);
    
    // Initialize SQLite database connection
    const sqliteDB = new Database(dbPath);
    console.log('✅ Server: SQLite connection initialized');
    
    // Initialize Drizzle ORM
    const dbInstance = drizzle(sqliteDB, { schema });
    console.log('✅ Server: Drizzle ORM initialized with schema');
    
    // Apply migrations and seed data
    await applyMigrations(dbInstance, sqliteDB);
    await seedProducts(dbInstance);
    
    return { db: dbInstance, sqlite: sqliteDB };
  } catch (error) {
    console.error('❌ Server: Database initialization failed:', error);
    throw error;
  }
}

// Export schema for convenience
export { schema };
