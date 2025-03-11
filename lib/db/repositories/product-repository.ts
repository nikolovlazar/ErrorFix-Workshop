/**
 * FILE OVERVIEW:
 * Purpose: Provide data access methods for product-related operations using Drizzle ORM and SQLite
 * Key Concepts: Repository pattern, Drizzle ORM, SQLite, Data access layer
 * Module Type: Repository
 * @ai_context: This file implements the repository pattern for product-related database operations
 */

import { schema } from '../index';
import { getDB, getSQLiteConnection } from '../client';
import { Product as ProductType } from '@/types';
import { sql } from 'drizzle-orm';

// Repository for product-related operations
export class ProductRepository {
  // Get all products
  async getAllProducts(): Promise<ProductType[]> {
    try {
      const db = await getDB();
      const sqliteDB = await getSQLiteConnection();
      
      // Using raw query for complex joins across multiple tables
      const result = sqliteDB.prepare(`
        SELECT 
          p.id, 
          p.name, 
          p.description, 
          p.price, 
          p.category, 
          p.featured, 
          p.in_stock as inStock, 
          p.rating, 
          p.review_count as reviewCount,
          p.images,
          p.sizes,
          p.colors
        FROM products p
        ORDER BY p.id
      `).all();
      
      // Parse the products with JSON fields
      const products = result.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        category: row.category,
        featured: Boolean(row.featured),
        inStock: Boolean(row.inStock),
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
      const sqliteDB = await getSQLiteConnection();
      
      // Get the product data
      const result = sqliteDB.prepare(
        `SELECT 
          id, 
          name, 
          description, 
          price, 
          category, 
          featured, 
          in_stock as inStock, 
          rating, 
          review_count as reviewCount,
          images,
          sizes,
          colors
        FROM products 
        WHERE id = ?`
      ).all(id);
      
      if (result.length === 0) {
        return null;
      }
      
      const row = result[0];
      
      // Parse the product with JSON fields
      const product = {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        category: row.category,
        featured: Boolean(row.featured),
        inStock: Boolean(row.inStock),
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
      const sqliteDB = await getSQLiteConnection();
      
      // Begin transaction
      sqliteDB.exec('BEGIN TRANSACTION');
      
      try {
        // Prepare the insert statement
        const stmt = sqliteDB.prepare(
          `INSERT INTO products 
            (name, description, price, category, featured, in_stock, rating, review_count, images, sizes, colors) 
          VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        
        for (const product of products) {
          // Insert the product with JSON fields
          stmt.run(
            product.name,
            product.description,
            product.price,
            product.category,
            product.featured ? 1 : 0,
            product.inStock ? 1 : 0,
            product.rating,
            product.reviewCount,
            JSON.stringify(product.images),
            JSON.stringify(product.sizes || []),
            JSON.stringify(product.colors || [])
          );
        }
        
        // Commit the transaction
        sqliteDB.exec('COMMIT');
        console.log('Sample data inserted successfully');
      } catch (error) {
        // Rollback the transaction if any error occurs
        sqliteDB.exec('ROLLBACK');
        throw error;
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
