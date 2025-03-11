import { sql } from 'drizzle-orm';
import { initializeDb, schema } from '../lib/db';
import { products as importedProducts } from '@/lib/data';

async function main() {
  const { db } = await initializeDb();

  console.log('⏳ Server: Checking if products need to be seeded...');

  try {
    // Check if products table has any rows
    const result = await db
      .select({ count: sql`count(*)` })
      .from(schema.products)
      .all();
    const count = parseInt(result[0]?.count?.toString() || '0');
    console.log(`✅ Server: Found ${count} existing products`);

    if (count === 0) {
      console.log('🌱 Server: Seeding products table...');

      // Use imported products from data.ts
      const products = importedProducts;

      // Insert each product
      for (const product of products) {
        // Insert products with proper JSON conversion
        db.insert(schema.products)
          .values({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            featured: product.featured,
            inStock: product.inStock,
            rating: product.rating,
            reviewCount: product.reviewCount,
            images: product.images,
            sizes: product.sizes,
            colors: product.colors,
          })
          .run();
      }

      console.log(`✅ Server: Seeded ${products.length} products`);
    }
  } catch (error) {
    console.error('❌ Server: Error seeding products:', error);
    throw error;
  }
}

main();
