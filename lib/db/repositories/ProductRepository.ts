import { sql } from "drizzle-orm";
import { getDB } from "../client";
import { Product } from "@/types";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Flag to disable mocks - set this to true to prevent using mock data as fallbacks
const DISABLE_MOCK_FALLBACKS = true;

// Mock products for server-side rendering or fallback
const mockProducts: Product[] = [
  {
    id: "1",
    name: "React Error Fixer Pro",
    description: "Automatically fixes common React errors",
    price: 99.99,
    category: "JavaScript",
    featured: true,
    inStock: true,
    rating: 4.8,
    reviewCount: 120,
    images: ["/images/products/product-1.jpg"],
    sizes: ["Standard", "Enterprise"],
    colors: ["Blue", "Green"]
  },
  {
    id: "2",
    name: "TypeScript Type Guard",
    description: "Prevents type errors in your TypeScript code",
    price: 79.99,
    category: "TypeScript",
    featured: true,
    inStock: true,
    rating: 4.5,
    reviewCount: 98,
    images: ["/images/products/product-2.jpg"],
    sizes: ["Standard", "Enterprise"],
    colors: ["Blue", "Red"]
  },
  {
    id: "3",
    name: "Next.js Router Resolver",
    description: "Resolves navigation and routing issues in Next.js",
    price: 89.99,
    category: "Next.js",
    featured: false,
    inStock: true,
    rating: 4.7,
    reviewCount: 75,
    images: ["/images/products/product-3.jpg"],
    sizes: ["Standard", "Enterprise"],
    colors: ["Purple", "Black"]
  }
];

/**
 * Fetches all products from the database or returns mock data in server environment
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    // In server environment, return mock data only if not disabled
    if (!isBrowser) {
      console.log('Running in server environment, returning mock products');
      return DISABLE_MOCK_FALLBACKS ? [] : mockProducts;
    }
    
    console.log('Fetching all products from database...');
    const db = await getDB();
    
    if (!db) {
      console.error('Database client is null');
      return DISABLE_MOCK_FALLBACKS ? [] : mockProducts;
    }
    
    // First check what tables and columns we actually have
    try {
      const tableInfo = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'products'
      `);
      console.log('Products table structure:', tableInfo.rows);
    } catch (infoError) {
      console.error('Error fetching table structure:', infoError);
    }
    
    // Try a simplified query first to see what we get
    try {
      const result = await db.execute(sql`SELECT * FROM products LIMIT 1`);
      console.log('Raw product data sample:', result.rows[0]);
    } catch (sampleError) {
      console.error('Error fetching sample product:', sampleError);
    }
    
    // Now perform the actual query
    const result = await db.execute(sql`
      SELECT 
        id, name, description, price, category, 
        featured, in_stock, rating, review_count,
        images, sizes, colors
      FROM products
    `);
    
    if (!result.rows || result.rows.length === 0) {
      console.log('No products found in database');
      return DISABLE_MOCK_FALLBACKS ? [] : mockProducts;
    }
    
    // Parse JSON fields and transform to Product type
    const products: Product[] = result.rows.map(row => ({
      id: String(row.id),
      name: String(row.name),
      description: String(row.description),
      price: Number(row.price),
      category: String(row.category),
      featured: Boolean(row.featured),
      inStock: Boolean(row.in_stock), // Map directly from db column name
      rating: Number(row.rating),
      reviewCount: Number(row.review_count), // Map directly from db column name
      images: parseJsonField(row.images) as string[],
      sizes: parseJsonField(row.sizes) as string[],
      colors: parseJsonField(row.colors) as string[]
    }));
    
    console.log(`Fetched ${products.length} products from database`);
    return products;
  } catch (error) {
    console.error('Error fetching products from database:', error);
    return DISABLE_MOCK_FALLBACKS ? [] : mockProducts;
  }
}

/**
 * Fetches featured products from the database or returns mock featured products in server environment
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    // In server environment, return mock featured products
    if (!isBrowser) {
      console.log('Running in server environment, returning mock featured products');
      return DISABLE_MOCK_FALLBACKS ? [] : mockProducts.filter(product => product.featured);
    }
    
    console.log('Fetching featured products from database...');
    const db = await getDB();
    
    if (!db) {
      console.error('Database client is null');
      return DISABLE_MOCK_FALLBACKS ? [] : mockProducts.filter(product => product.featured);
    }
    
    const result = await db.execute(sql`
      SELECT 
        id, name, description, price, category, 
        featured, in_stock, rating, review_count,
        images, sizes, colors
      FROM products
      WHERE featured = true
    `);
    
    if (!result.rows || result.rows.length === 0) {
      console.log('No featured products found in database');
      return DISABLE_MOCK_FALLBACKS ? [] : mockProducts.filter(product => product.featured);
    }
    
    // Parse JSON fields and transform to Product type
    const products: Product[] = result.rows.map(row => ({
      id: String(row.id),
      name: String(row.name),
      description: String(row.description),
      price: Number(row.price),
      category: String(row.category),
      featured: Boolean(row.featured),
      inStock: Boolean(row.in_stock), // Map directly from db column name
      rating: Number(row.rating),
      reviewCount: Number(row.review_count), // Map directly from db column name
      images: parseJsonField(row.images) as string[],
      sizes: parseJsonField(row.sizes) as string[],
      colors: parseJsonField(row.colors) as string[]
    }));
    
    console.log(`Fetched ${products.length} featured products from database`);
    return products;
  } catch (error) {
    console.error('Error fetching featured products from database:', error);
    return DISABLE_MOCK_FALLBACKS ? [] : mockProducts.filter(product => product.featured);
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
 * Fetches a single product by ID from the database or returns mock product in server environment
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    // In server environment, return mock product by id
    if (!isBrowser) {
      console.log(`Running in server environment, returning mock product with ID ${id}`);
      if (DISABLE_MOCK_FALLBACKS) return null;
      const mockProduct = mockProducts.find(product => product.id === id);
      return mockProduct || null;
    }
    
    console.log(`Fetching product with ID ${id} from database...`);
    const db = await getDB();
    
    if (!db) {
      console.error('Database client is null');
      if (DISABLE_MOCK_FALLBACKS) return null;
      const mockProduct = mockProducts.find(product => product.id === id);
      return mockProduct || null;
    }
    
    const result = await db.execute(sql`
      SELECT 
        id, name, description, price, category, 
        featured, in_stock, rating, review_count,
        images, sizes, colors
      FROM products
      WHERE id = ${id}
    `);
    
    if (!result.rows || result.rows.length === 0) {
      console.log(`No product found with ID ${id}`);
      if (DISABLE_MOCK_FALLBACKS) return null;
      const mockProduct = mockProducts.find(product => product.id === id);
      return mockProduct || null;
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
      inStock: Boolean(row.in_stock), // Map directly from db column name
      rating: Number(row.rating),
      reviewCount: Number(row.review_count), // Map directly from db column name
      images: parseJsonField(row.images) as string[],
      sizes: parseJsonField(row.sizes) as string[],
      colors: parseJsonField(row.colors) as string[]
    };
    
    console.log(`Successfully fetched product with ID ${id}`);
    return product;
  } catch (error) {
    console.error(`Error fetching product with ID ${id} from database:`, error);
    if (DISABLE_MOCK_FALLBACKS) return null;
    const mockProduct = mockProducts.find(product => product.id === id);
    return mockProduct || null;
  }
} 