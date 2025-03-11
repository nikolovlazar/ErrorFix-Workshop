/**
 * FILE OVERVIEW:
 * Purpose: Database API that uses server-side implementation only
 * Key Concepts: Server-side only database access through API endpoints
 * Module Type: Service
 * @ai_context: This module provides an API that works with server-side database only
 */

// Import schema for typing
import { initDb } from './db-server';
import * as schema from './schema';

// Type for product data
export type Product = {
  id: string | number;
  name: string;
  description: string;
  price: number;
  category: string;
  featured: boolean;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
};

/**
 * Initialize the database (server-side only)
 * Client-side code should use API endpoints to access data
 */
export async function initializeDb() {
  // Only allow this function to be called on the server
  if (typeof window !== 'undefined') {
    console.error('❌ Database initialization attempted in client environment');
    throw new Error('Database can only be initialized on the server');
  }

  try {
    // Initialize the database using the server-side implementation
    return await initDb();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Export schema directly
export { schema };
