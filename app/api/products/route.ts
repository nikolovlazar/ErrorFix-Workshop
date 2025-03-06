/**
 * FILE OVERVIEW:
 * Purpose: API endpoint to provide information about accessing products
 * Key Concepts: Next.js API routes, Client-side database
 * Module Type: API Handler
 */

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { products } from '@/lib/data'; // Import static data for fallback

// Flag to disable fallback products
const DISABLE_FALLBACK_PRODUCTS = true;

/**
 * GET handler for /api/products
 * Returns all products from the client-side database or falls back to static data
 */
export async function GET() {
  console.log('🔄 API: Products API route accessed');
  
  try {
    // First try to access the client-side database
    try {
      // Dynamically import the client DB
      const { getDB } = await import('@/lib/db/client');
      const db = await getDB();
      
      if (!db) {
        throw new Error('Database client is null');
      }
      
      // Query all products
      const result = await db.execute(sql`SELECT * FROM "products"`);
      
      if (result.rows && result.rows.length > 0) {
        return NextResponse.json({ 
          success: true, 
          products: result.rows 
        });
      } else {
        // If DB returns empty result, fall through to static data
        console.log('DB returned empty result, falling back to static data');
        
        // Respect the flag for fallback data
        if (DISABLE_FALLBACK_PRODUCTS) {
          return NextResponse.json({ 
            success: true, 
            products: [],
            source: 'empty_database'
          });
        }
      }
    } catch (dbError) {
      // Log the error but continue to fallback data
      console.log('Cannot access database from server:', dbError);
      
      // Respect the flag for fallback data
      if (DISABLE_FALLBACK_PRODUCTS) {
        return NextResponse.json({ 
          success: true, 
          products: [],
          source: 'db_error'
        });
      }
    }
    
    // Fallback to static data if DB access fails or returns no results
    console.log('Using static product data as fallback');
    return NextResponse.json({ 
      success: true, 
      products: products,
      source: 'static_fallback'
    });
    
  } catch (error) {
    console.error('Error in products API route:', error);
    return NextResponse.json({
      success: false,
      message: 'Error processing request',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// This is still needed for Next.js static generation
export function generateStaticParams() {
  return [{}];
}
