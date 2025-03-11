/**
 * FILE OVERVIEW:
 * Purpose: Define database schema for the application using Drizzle ORM
 * Key Concepts: Drizzle ORM, SQLite schema definitions, relations
 * Module Type: Schema
 * @ai_context: This file defines the database schema for the application, starting with products
 */

import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Products table schema
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  category: text('category').notNull(),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  inStock: integer('in_stock', { mode: 'boolean' }).notNull().default(true),
  rating: real('rating'),
  reviewCount: integer('review_count').default(0),
  images: text('images', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  sizes: text('sizes', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  colors: text('colors', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
});

// Product images table schema
export const productImages = sqliteTable('product_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id).notNull(),
  url: text('url').notNull(),
});

// Product sizes table schema
export const productSizes = sqliteTable('product_sizes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id).notNull(),
  size: text('size').notNull(),
});

// Product colors table schema
export const productColors = sqliteTable('product_colors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id).notNull(),
  color: text('color').notNull(),
});

// Export types for TypeScript
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

export type ProductSize = typeof productSizes.$inferSelect;
export type NewProductSize = typeof productSizes.$inferInsert;

export type ProductColor = typeof productColors.$inferSelect;
export type NewProductColor = typeof productColors.$inferInsert;
