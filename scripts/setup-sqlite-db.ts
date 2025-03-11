/**
 * Script to set up SQLite database directly
 * This script creates the database schema and seeds it with data
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { products } from '../lib/data';

// Get database path
const dbPath = join(process.cwd(), 'sqlite.db');
console.log(`Setting up SQLite database at: ${dbPath}`);

// Main function to set up database
async function setupDatabase() {
  try {
    // Connect to SQLite database (creates it if it doesn't exist)
    const db = new Database(dbPath);
    console.log('Connected to SQLite database');
    
    // Create tables
    createTables(db);
    
    // Seed data
    seedData(db);
    
    // Display tables in database
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📊 Tables in database:', tables.map((row: any) => row.name));
    
    // Close database connection
    db.close();
    
    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Function to create tables
function createTables(db: Database.Database) {
  console.log('Creating tables...');
  
  // Create products table
  db.exec(`
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
    )
  `);
  
  // Create product_images table
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  
  // Create product_sizes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      size TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  
  // Create product_colors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_colors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      color TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  
  console.log('Tables created successfully');
}

// Function to seed data
function seedData(db: Database.Database) {
  console.log('Seeding data...');
  
  // Check if products table already has data
  const countResult = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  
  if (countResult && countResult.count > 0) {
    console.log(`Products table already has ${countResult.count} rows, skipping seeding`);
    return;
  }
  
  // Start a transaction
  db.exec('BEGIN TRANSACTION');
  
  try {
    // Prepare statement for inserting products
    const insertProduct = db.prepare(`
      INSERT INTO products (
        name, description, price, category, featured, in_stock, 
        rating, review_count, images, sizes, colors
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Insert each product
    for (const product of products) {
      insertProduct.run(
        product.name,
        product.description,
        product.price,
        product.category,
        product.featured ? 1 : 0,
        product.inStock ? 1 : 0,
        product.rating,
        product.reviewCount,
        JSON.stringify(product.images),
        JSON.stringify(product.sizes || []),
        JSON.stringify(product.colors || [])
      );
    }
    
    // Commit the transaction
    db.exec('COMMIT');
    console.log(`Seeded ${products.length} products`);
  } catch (error) {
    // Rollback on error
    db.exec('ROLLBACK');
    console.error('Error seeding data:', error);
    throw error;
  }
}

// Run the setup
setupDatabase();
