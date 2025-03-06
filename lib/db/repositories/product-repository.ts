/**
 * FILE OVERVIEW:
 * Purpose: Provide data access methods for product-related operations using Drizzle ORM and PGlite
 * Key Concepts: Repository pattern, Drizzle ORM, PGlite, Data access layer
 * Module Type: Repository
 * @ai_context: This file implements the repository pattern for product-related database operations
 */

import { schema } from '../index';
import { getDB, getPGClient } from '../client';
import { Product as ProductType } from '@/types';

// Repository for product-related operations
export class ProductRepository {
  // Get all products
  async getAllProducts(): Promise<ProductType[]> {
    try {
      const db = await getDB();
      const pglite = await getPGClient();
      
      // Using raw query for complex joins across multiple tables
      const result = await pglite.query(`
        SELECT 
          p.id, 
          p.name, 
          p.description, 
          p.price, 
          p.category, 
          p.featured, 
          p.in_stock as "inStock", 
          p.rating, 
          p.review_count as "reviewCount"
        FROM products p
        ORDER BY p.id
      `);
      
      // Get the basic product data
      const products = result.rows as Omit<ProductType, 'images' | 'sizes' | 'colors'>[];
      
      // For each product, get its images, sizes, and colors
      const enhancedProducts = await Promise.all(
        products.map(async (product) => {
          // Get images
          const imagesResult = await pglite.query(
            'SELECT url FROM product_images WHERE product_id = $1',
            [product.id]
          );
          const images = imagesResult.rows.map((row: any) => row.url);
          
          // Get sizes
          const sizesResult = await pglite.query(
            'SELECT size FROM product_sizes WHERE product_id = $1',
            [product.id]
          );
          const sizes = sizesResult.rows.map((row: any) => row.size);
          
          // Get colors
          const colorsResult = await pglite.query(
            'SELECT color FROM product_colors WHERE product_id = $1',
            [product.id]
          );
          const colors = colorsResult.rows.map((row: any) => row.color);
          
          // Return the complete product
          return {
            ...product,
            images,
            sizes,
            colors
          } as ProductType;
        })
      );
      
      return enhancedProducts;
    } catch (error) {
      console.error('Error getting all products:', error);
      throw error;
    }
  }
  
  // Get a product by ID
  async getProductById(id: string): Promise<ProductType | null> {
    try {
      const db = await getDB();
      const pglite = await getPGClient();
      
      // Get the basic product data
      const result = await pglite.query(
        `SELECT 
          id, 
          name, 
          description, 
          price, 
          category, 
          featured, 
          in_stock as "inStock", 
          rating, 
          review_count as "reviewCount"
        FROM products 
        WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const product = result.rows[0] as Omit<ProductType, 'images' | 'sizes' | 'colors'>;
      
      // Get images
      const imagesResult = await pglite.query(
        'SELECT url FROM product_images WHERE product_id = $1',
        [id]
      );
      const images = imagesResult.rows.map((row: any) => row.url);
      
      // Get sizes
      const sizesResult = await pglite.query(
        'SELECT size FROM product_sizes WHERE product_id = $1',
        [id]
      );
      const sizes = sizesResult.rows.map((row: any) => row.size);
      
      // Get colors
      const colorsResult = await pglite.query(
        'SELECT color FROM product_colors WHERE product_id = $1',
        [id]
      );
      const colors = colorsResult.rows.map((row: any) => row.color);
      
      // Return the complete product
      return {
        ...product,
        images,
        sizes,
        colors
      } as ProductType;
    } catch (error) {
      console.error(`Error getting product with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Insert sample data for testing
  async insertSampleData(products: ProductType[]): Promise<void> {
    try {
      const pglite = await getPGClient();
      
      // Use a transaction to ensure all data is inserted or none
      await pglite.exec('BEGIN');
      
      try {
        for (const product of products) {
          // Insert the product
          const result = await pglite.query(
            `INSERT INTO products 
              (name, description, price, category, featured, in_stock, rating, review_count) 
            VALUES 
              ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING id`,
            [
              product.name,
              product.description,
              product.price,
              product.category,
              product.featured,
              product.inStock,
              product.rating,
              product.reviewCount
            ]
          );
          
          const productId = (result.rows[0] as { id: number }).id;
          
          // Insert images
          for (const imageUrl of product.images) {
            await pglite.query(
              'INSERT INTO product_images (product_id, url) VALUES ($1, $2)',
              [productId, imageUrl]
            );
          }
          
          // Insert sizes
          for (const size of product.sizes) {
            await pglite.query(
              'INSERT INTO product_sizes (product_id, size) VALUES ($1, $2)',
              [productId, size]
            );
          }
          
          // Insert colors
          for (const color of product.colors) {
            await pglite.query(
              'INSERT INTO product_colors (product_id, color) VALUES ($1, $2)',
              [productId, color]
            );
          }
        }
        
        // Commit the transaction
        await pglite.exec('COMMIT');
        console.log('Sample data inserted successfully');
      } catch (error) {
        // Rollback the transaction if any error occurs
        await pglite.exec('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error inserting sample data:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const productRepository = new ProductRepository();
