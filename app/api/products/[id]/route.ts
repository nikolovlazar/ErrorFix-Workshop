import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { initDb } from '@/lib/db/db-server';
// import * as Sentry from '@sentry/nextjs';
import { products } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log(`🔍 API: Looking for product with ID ${id}`);
  
  try {
    // Initialize the server-side database connection
    const { db } = await initDb();
    
    // Use a more specific query with error handling for invalid IDs
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ 
        error: `Invalid product ID: ${id}`,
        message: 'The product ID must be a valid number',
        code: 'INVALID_ID'
      }, { status: 400 });
    }
    
    // BREAK-THIS: Ha - I've sabotaged you with bad queries
    const result = await db.execute(sql`SELECT * FROM "product" WHERE id = ${numId}`);
    
    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      
      // Parse JSON fields
      const product = {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        category: row.category,
        featured: row.featured,
        inStock: row.in_stock,
        rating: row.rating,
        reviewCount: row.review_count,
        images: parseJsonField(row.images),
        sizes: parseJsonField(row.sizes),
        colors: parseJsonField(row.colors)
      };
      
      return NextResponse.json(product);
    }
    
    // If no product found in database, return 404 (removed fallback to static data)
    return NextResponse.json(
      { 
        error: `Product not found: ${id}`,
        message: 'The requested product does not exist in the database',
        code: 'PRODUCT_NOT_FOUND'
      },
      { status: 404 }
    );
  } catch (error) {
    console.error(`API error for product ${id}:`, error);
    
    // SENTRY-THIS: Cathing your exceptions!
    // Sentry.captureException(error);

    // Return standardized error response with more details
    return NextResponse.json(
      { 
        error: 'Failed to fetch product from database',
        message: 'An error occurred while retrieving the product',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        code: 'DATABASE_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to parse JSON fields
 */
function parseJsonField(value: any): any[] {
  if (!value) return [];
  
  try {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  } catch (e) {
    console.error('Error parsing JSON field:', e);
    return [];
  }
}

// This is needed for Next.js static generation
export function generateStaticParams() {
  return products.map((product: any) => ({
    id: String(product.id),
  }));
}
