/**
 * Script to seed the SQLite database with initial data
 */

import Database from 'better-sqlite3';
import { join } from 'node:path';
import { products as importedProducts } from '../lib/data';

// Get database path
const dbPath = join(process.cwd(), 'sqlite.db');
console.log(`SQLite database path: ${dbPath}`);

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Connect to SQLite database
    const db = new Database(dbPath);
    console.log('Connected to SQLite database');

    // Check if products table exists
    const tableExists = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='products'"
      )
      .get();

    if (!tableExists) {
      console.error('Products table does not exist. Run migrations first.');
      process.exit(1);
    }

    // Check if products table has any rows
    const result = db.prepare('SELECT COUNT(*) as count FROM products').get();
    const count = Number.parseInt((result as any).count);
    console.log(`Found ${count} existing products`);

    if (count > 0) {
      console.log('Database already has products, skipping seed');
      db.close();
      return;
    }

    console.log('Seeding products table...');

    // Begin transaction
    db.exec('BEGIN TRANSACTION');

    try {
      // Prepare insert statement
      const insertStmt = db.prepare(`
        INSERT INTO products (
          id, name, description, price, category, featured, in_stock, rating, review_count,
          images, sizes, colors
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      // Insert each product
      for (const product of importedProducts) {
        insertStmt.run(
          product.id,
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

      // Commit transaction
      db.exec('COMMIT');
      console.log(`✅ Seeded ${importedProducts.length} products`);
    } catch (error) {
      // Rollback transaction on error
      db.exec('ROLLBACK');
      console.error('❌ Error seeding products:', error);
      throw error;
    }

    // Close database connection
    db.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
