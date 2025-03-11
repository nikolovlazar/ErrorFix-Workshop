import { sql } from "drizzle-orm";
import * as dbSchema from "../schema"; // Import schema directly
import { products as importedProducts } from '@/lib/data'; // Import all products from data.ts

// Key for localStorage
export const DB_SEEDING_ENABLED_KEY = 'db_seeding_enabled';

// Check if database seeding is enabled
function isSeedingEnabled(): boolean {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const storedValue = localStorage.getItem(DB_SEEDING_ENABLED_KEY);
    return storedValue === null || storedValue === 'true';
  }
  
  // If running on server or localStorage is not available, default to true
  return true;
}

// Use the imported products from data.ts to ensure all products are included
const productsData = importedProducts;

export const seedProducts = async (db: any) => {
  try {
    console.log('Starting product seeding...');
    
    // Skip checking for existing products and just create the table if needed
    try {
      console.log('Creating products table if it does not exist...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "products" (
          "id" SERIAL PRIMARY KEY, 
          "name" TEXT NOT NULL, 
          "description" TEXT NOT NULL, 
          "price" DOUBLE PRECISION NOT NULL, 
          "category" TEXT NOT NULL,
          "featured" BOOLEAN NOT NULL DEFAULT FALSE, 
          "in_stock" BOOLEAN NOT NULL DEFAULT TRUE, 
          "rating" DOUBLE PRECISION, 
          "review_count" INTEGER DEFAULT 0,
          "images" JSONB NOT NULL DEFAULT '[]', 
          "sizes" JSONB NOT NULL DEFAULT '[]', 
          "colors" JSONB NOT NULL DEFAULT '[]'
        )
      `);
      console.log('Products table created or already exists');
    } catch (tableError) {
      console.error('Error creating products table:', tableError);
      throw tableError;
    }
    
    // First check if products already exist to avoid duplicates
    try {
      const existingProducts = await db.execute(sql`SELECT COUNT(*) FROM products`);
      const productCount = parseInt(existingProducts.rows?.[0]?.count || '0', 10);
      
      if (productCount === 0) {
        // Check if seeding is enabled
        if (!isSeedingEnabled()) {
          console.log('🔵 Database seeding is disabled. Skipping product seeding.');
          return productCount;
        }
        
        console.log('No existing products found, seeding products table with initial data...');
        
        // Insert products one by one
        for (const product of productsData) {
          console.log(`Inserting product: ${product.name}`);
          await db.execute(sql`
            INSERT INTO products (
              id, name, description, price, category, featured, in_stock, 
              rating, review_count, images, sizes, colors
            ) VALUES (
              ${parseInt(product.id, 10)}, 
              ${product.name}, 
              ${product.description}, 
              ${product.price}, 
              ${product.category}, 
              ${product.featured}, 
              ${product.inStock}, 
              ${product.rating}, 
              ${product.reviewCount}, 
              ${JSON.stringify(product.images)}, 
              ${JSON.stringify(product.sizes)}, 
              ${JSON.stringify(product.colors)}
            )
          `);
        }
        
        console.log('✅ Successfully seeded products table with initial data');
      } else {
        console.log(`ℹ️ Products table already contains ${productCount} products, skipping seeding`);
      }
      
      return productCount;
    } catch (error) {
      console.error('❌ Error seeding products table:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ Error in seedProducts function:', error);
    throw error;
  }
}; 