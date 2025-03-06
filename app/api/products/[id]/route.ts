import { NextResponse } from 'next/server';
import { products } from '@/lib/data'; // Keep for generateStaticParams
import { sql } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log(`🔍 API: Looking for product with ID ${id}`);
  
  try {
    // In a server environment, we'll dynamically import the client DB
    // This matches how we're accessing the DB in the reset route
    try {
      const { getDB } = await import('@/lib/db/client');
      const db = await getDB();
      
      if (!db) {
        throw new Error('Database client is null');
      }
      
      // Use a more specific query with error handling for invalid IDs
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        return NextResponse.json({ error: `Invalid product ID: ${id}` }, { status: 400 });
      }
      
      const result = await db.execute(sql`SELECT * FROM "products" WHERE id = ${numId}`);
      
      if (result.rows && result.rows.length > 0) {
        return NextResponse.json({ success: true, product: result.rows[0] });
      }
      
      // Fall through to static data if DB has no matching product
    } catch (dbError) {
      // Just log and continue to fallback if we can't access the DB
      console.log('Cannot access database from server:', dbError);
    }
    
    // Fallback to static data
    const staticProduct = products.find(p => String(p.id) === id);
    
    if (staticProduct) {
      return NextResponse.json({ success: true, product: staticProduct });
    }
    
    return NextResponse.json(
      { success: false, error: `Product not found: ${id}` },
      { status: 404 }
    );
  } catch (error) {
    console.error(`API error for product ${id}:`, error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// This is needed for Next.js static generation
export function generateStaticParams() {
  return products.map(product => ({
    id: String(product.id),
  }));
}
