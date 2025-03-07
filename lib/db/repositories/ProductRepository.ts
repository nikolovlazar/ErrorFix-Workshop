import { sql } from "drizzle-orm";
import { getDB, getPGClient } from "../client";
import { Product } from "@/types";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Flag to disable mocks - set this to true to prevent using mock data as fallbacks
const DISABLE_MOCK_FALLBACKS = true;

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
    
    console.log('Fetching all products from database...');
    const db = await getDB();
    const pgPool = await getPGClient();
    
    // Now perform the query
    const result = await pgPool.query(`
      SELECT 
        id, name, description, price, category, 
        featured, in_stock as "inStock", rating, review_count as "reviewCount",
        images, sizes, colors
      FROM products
    `);
    
    if (!result.rows || result.rows.length === 0) {
      console.log('No products found in database');
      return [];
    }
    
    // Parse JSON fields and transform to Product type
    const products: Product[] = result.rows.map((row: any) => ({
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
      colors: parseJsonField(row.colors) as string[]
    }));
    
    console.log(`Fetched ${products.length} products from database`);
    return products;
  } catch (error) {
    console.error('Error fetching products from database:', error);
    return [];
  }
}

/**
 * Fetches featured products from the database
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    // In browser environment, we should use API endpoints
    if (isBrowser) {
      console.log('Running in browser environment, use API endpoints instead');
      return [];
    }
    
    console.log('Fetching featured products from database...');
    const db = await getDB();
    const pgPool = await getPGClient();
    
    const result = await pgPool.query(`
      SELECT 
        id, name, description, price, category, 
        featured, in_stock as "inStock", rating, review_count as "reviewCount",
        images, sizes, colors
      FROM products
      WHERE featured = true
    `);
    
    if (!result.rows || result.rows.length === 0) {
      console.log('No featured products found in database');
      return [];
    }
    
    // Parse JSON fields and transform to Product type
    const products: Product[] = result.rows.map((row: any) => ({
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
      colors: parseJsonField(row.colors) as string[]
    }));
    
    console.log(`Fetched ${products.length} featured products from database`);
    return products;
  } catch (error) {
    console.error('Error fetching featured products from database:', error);
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

/**
 * Fetches a single product by ID from the database
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    // In browser environment, we should use API endpoints
    if (isBrowser) {
      console.log(`Running in browser environment, use API endpoints instead`);
      return null;
    }
    
    console.log(`Fetching product with ID ${id} from database...`);
    const db = await getDB();
    const pgPool = await getPGClient();
    
    const result = await pgPool.query(`
      SELECT 
        id, name, description, price, category, 
        featured, in_stock as "inStock", rating, review_count as "reviewCount",
        images, sizes, colors
      FROM products
      WHERE id = $1
    `, [id]);
    
    if (!result.rows || result.rows.length === 0) {
      console.log(`No product found with ID ${id}`);
      return null;
    }
    
    const row = result.rows[0];
    
    // Parse JSON fields and transform to Product type
    const product: Product = {
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
      colors: parseJsonField(row.colors) as string[]
    };
    
    console.log(`Successfully fetched product with ID ${id}`);
    return product;
  } catch (error) {
    console.error(`Error fetching product with ID ${id} from database:`, error);
    return null;
  }
}
