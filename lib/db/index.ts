/**
 * FILE OVERVIEW:
 * Purpose: Export server-side database functionality. This is the main entry point for database access.
 * Key Concepts: Server-side database, API endpoints for client access
 * Module Type: Service
 * @ai_context: This file re-exports the server-side database functionality
 */

// Import and re-export database functionality from the server-side implementation
import { initializeDb, safeJsonParse, type Product } from './db';
import * as schema from './schema';

// Re-export for use in other files
export {
  initializeDb,
  safeJsonParse,
  schema
};

// Re-export types
export type { Product };

// Re-export server implementation types and functions if needed
export type { 
  // Add any specific types you need to export here
}
