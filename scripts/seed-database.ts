/**
 * Script to seed the SQLite database with initial data
 */

import { db } from '@/lib/db';
import { products as importedProducts } from '../lib/data';
import { count, sql } from 'drizzle-orm';
import { products } from '@/lib/db/schema';

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Check if products table has any rows
    const result = await db.select().from(products);
    const c = result.length;
    console.log(`Found ${c} existing products`);

    if (c > 0) {
      console.log('Database already has products, skipping seed');
      return;
    }

    console.log('Seeding products table...');

    try {
      // Insert all products
      await db.insert(products).values(
        importedProducts.map((product) => ({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          featured: product.featured,
          inStock: product.inStock,
          rating: product.rating,
          reviewCount: product.reviewCount,
          images: product.images,
          sizes: product.sizes || [],
          colors: product.colors || [],
        }))
      );
      console.log(`✅ Seeded ${importedProducts.length} products`);
    } catch (error) {
      console.error('❌ Error seeding products:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
