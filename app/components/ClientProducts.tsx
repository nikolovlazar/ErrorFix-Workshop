import { ProductGrid } from '@/components/product-grid';
import { FeaturedCollection } from '@/components/featured-collection';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
// import * as Sentry from '@sentry/nextjs';

async function getProducts() {
  // return Sentry.startSpan({
  //   name: 'getProducts',
  //   op: 'function',
  // }, async (span) => {
    const result = await db.select().from(products);
    // span.setAttributes({
    //   count: result.length,
    // });
    return result;
  // });
}

export async function ClientProducts() {
  const products = await getProducts();
  const featuredProducts = products.filter((product) => product.featured);

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
