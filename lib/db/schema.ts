/**
 * FILE OVERVIEW:
 * Purpose: Define database schema for the application using Drizzle ORM
 * Key Concepts: Drizzle ORM, PostgreSQL schema definitions, relations
 * Module Type: Schema
 * @ai_context: This file defines the database schema for the application, starting with products
 */

import { pgTable, serial, text, integer, boolean, doublePrecision, json } from 'drizzle-orm/pg-core';

// Products table schema
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
  category: text('category').notNull(),
  featured: boolean('featured').notNull().default(false),
  inStock: boolean('in_stock').notNull().default(true),
  rating: doublePrecision('rating'),
  reviewCount: integer('review_count').default(0),
  images: json('images').$type<string[]>().notNull().default([]),
  sizes: json('sizes').$type<string[]>().notNull().default([]),
  colors: json('colors').$type<string[]>().notNull().default([]),
});

// Product images table schema
export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  url: text('url').notNull(),
});

// Product sizes table schema
export const productSizes = pgTable('product_sizes', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  size: text('size').notNull(),
});

// Product colors table schema
export const productColors = pgTable('product_colors', {
  id: serial('id').primaryKey(),
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
