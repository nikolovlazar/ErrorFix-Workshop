import { Product } from '@/types';
import { ProductGrid } from '@/components/product-grid';
import { FeaturedCollection } from '@/components/featured-collection';
import { initDb } from '@/lib/db/db-server';
import { sql } from 'drizzle-orm';

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

async function getProducts() {
  const { db } = await initDb();

  const result = await db.all(sql`SELECT * FROM products`);

  const products = result.map((row: any) => ({
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

  return products;
}

export async function ClientProducts() {
  const products = await getProducts();
  const featuredProducts = products.filter(
    (product: Product) => product.featured
  );

  return (
    <>
      <FeaturedCollection
        title='Featured Products'
        description='Unique artifacts from across the multiverse'
        products={featuredProducts}
      />
      <div className='container'>
        <h2 className='text-4xl font-bold tracking-tight mb-8 text-red-500'>
          All Products
        </h2>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <p className='text-center py-10 text-gray-500'>No products found</p>
        )}
      </div>
    </>
  );
}
