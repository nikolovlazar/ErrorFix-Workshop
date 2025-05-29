import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';

/**
 * GET handler for /api/products
 * Returns all products from the PostgreSQL database
 */
export async function GET() {
  try {
    const result = await db.select().from(products);

    const prods = result.map((row: any) => ({
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
      colors: parseJsonField(row.colors),
    }));

    return NextResponse.json(prods);
  } catch (error) {
    console.error('Error in products API route:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An error occurred while fetching products',
      },
      { status: 500 }
    );
  }
}

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

export function generateStaticParams() {
  return [{}];
}
