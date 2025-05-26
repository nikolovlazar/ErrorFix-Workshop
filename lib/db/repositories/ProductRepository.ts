import { getDB, getSQLiteConnection } from '../client';
import type { Product } from '@/types';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Fetches all products from the database or returns empty array in browser environment
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    // In browser environment, we should use API endpoints
    if (isBrowser) {
      console.log('Running in browser environment, use API endpoints instead');
      return [];
    }

    const sqliteDB = await getSQLiteConnection();

    // Now perform the query
    const result = sqliteDB
      .prepare(
        `
      SELECT
        id, name, description, price, category,
        featured, in_stock as inStock, rating, review_count as reviewCount,
        images, sizes, colors
      FROM products
    `
      )
      .all();

    if (!result || result.length === 0) {
      console.log('No products found in database');
      return [];
    }

    // Parse JSON fields and transform to Product type
    const products: Product[] = result.map((row: any) => ({
      id: String(row.id),
      name: String(row.name),
      description: String(row.description),
      price: Number(row.price),
      category: String(row.category),
      featured: Boolean(row.featured),
      inStock: Boolean(row.inStock),
      rating: Number(row.rating),
      reviewCount: Number(row.reviewCount),
      images: parseJsonField(row.images) as string[],
      sizes: parseJsonField(row.sizes) as string[],
      colors: parseJsonField(row.colors) as string[],
    }));

    return products;
  } catch (error) {
    console.error('Error fetching products from database:', error);
    return [];
  }
}

/**
 * Safely parses a JSON string or returns default value if invalid
 */
function parseJsonField(jsonStr: any): any[] {
  if (!jsonStr) return [];

  try {
    if (typeof jsonStr === 'string') {
      return JSON.parse(jsonStr);
    }
    return jsonStr;
  } catch (e) {
    console.error('Error parsing JSON field:', e);
    return [];
  }
}
