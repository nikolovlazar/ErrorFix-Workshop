import {
  pgTable,
  integer,
  text,
  real,
  boolean,
  json,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Products table schema
export const products = pgTable('products', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  category: text('category').notNull(),
  featured: boolean('featured').notNull().default(false),
  inStock: boolean('in_stock').notNull().default(true),
  rating: real('rating'),
  reviewCount: integer('review_count').default(0),
  images: json('images')
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  sizes: json('sizes')
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  colors: json('colors')
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
});

export type Product = typeof products.$inferSelect;
