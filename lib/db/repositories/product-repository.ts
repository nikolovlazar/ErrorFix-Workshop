/**
 * FILE OVERVIEW:
 * Purpose: Provide data access methods for product-related operations using Drizzle ORM and PostgreSQL
 * Key Concepts: Repository pattern, Drizzle ORM, PostgreSQL, Data access layer
 * Module Type: Repository
 * @ai_context: This file implements the repository pattern for product-related database operations
 */

import { schema } from '../index';
import { getDB, getPGClient } from '../client';
import { Product as ProductType } from '@/types';
import { sql } from 'drizzle-orm';

// Repository for product-related operations
export class ProductRepository {
  // Get all products
  async getAllProducts(): Promise<ProductType[]> {
    try {
      const db = await getDB();
      const pgPool = await getPGClient();
      
      // Using raw query for complex joins across multiple tables
      const result = await pgPool.query(`
        SELECT 
          p.id, 
          p.name, 
          p.description, 
          p.price, 
          p.category, 
          p.featured, 
          p.in_stock as "inStock", 
          p.rating, 
          p.review_count as "reviewCount",
          p.images,
          p.sizes,
          p.colors
        FROM products p
        ORDER BY p.id
      `);
      
      // Parse the products with JSON fields
      const products = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        category: row.category,
        featured: row.featured,
        inStock: row.inStock,
        rating: row.rating,
        reviewCount: row.reviewCount,
        images: this.parseJsonField(row.images),
        sizes: this.parseJsonField(row.sizes),
        colors: this.parseJsonField(row.colors)
      })) as ProductType[];
      
      return products;
    } catch (error) {
      console.error('Error getting all products:', error);
      throw error;
    }
  }
  
  // Get a product by ID
  async getProductById(id: string): Promise<ProductType | null> {
    try {
      const db = await getDB();
      const pgPool = await getPGClient();
      
      // Get the product data
      const result = await pgPool.query(
        `SELECT 
          id, 
          name, 
          description, 
          price, 
          category, 
          featured, 
          in_stock as "inStock", 
          rating, 
          review_count as "reviewCount",
          images,
          sizes,
          colors
        FROM products 
        WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      
      // Parse the product with JSON fields
      const product = {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        category: row.category,
        featured: row.featured,
        inStock: row.inStock,
        rating: row.rating,
        reviewCount: row.reviewCount,
        images: this.parseJsonField(row.images),
        sizes: this.parseJsonField(row.sizes),
        colors: this.parseJsonField(row.colors)
      } as ProductType;
      
      return product;
    } catch (error) {
      console.error(`Error getting product with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Insert sample data for testing
  async insertSampleData(products: ProductType[]): Promise<void> {
    try {
      const pgPool = await getPGClient();
      
      // Use a transaction to ensure all data is inserted or none
      const client = await pgPool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const product of products) {
          // Insert the product with JSON fields
          const result = await client.query(
            `INSERT INTO products 
              (name, description, price, category, featured, in_stock, rating, review_count, images, sizes, colors) 
            VALUES 
              ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING id`,
            [
              product.name,
              product.description,
              product.price,
              product.category,
              product.featured,
              product.inStock,
              product.rating,
              product.reviewCount,
              JSON.stringify(product.images),
              JSON.stringify(product.sizes || []),
              JSON.stringify(product.colors || [])
            ]
          );
        }
        
        // Commit the transaction
        await client.query('COMMIT');
        console.log('Sample data inserted successfully');
      } catch (error) {
        // Rollback the transaction if any error occurs
        await client.query('ROLLBACK');
        throw error;
      } finally {
        // Release the client back to the pool
        client.release();
      }
    } catch (error) {
      console.error('Error inserting sample data:', error);
      throw error;
    }
  }
  
  // Helper method to parse JSON fields
  private parseJsonField(value: any): any[] {
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
}

// Export a singleton instance
export const productRepository = new ProductRepository();
