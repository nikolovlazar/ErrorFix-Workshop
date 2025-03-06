'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { getAllProducts, getFeaturedProducts } from '@/lib/db/repositories/ProductRepository';
import { ProductGrid } from '@/components/product-grid';
import { FeaturedCollection } from '@/components/featured-collection';
import { ProductGridSkeleton, FeaturedProductsSkeleton } from './ProductSkeleton';
import { DB_REFRESH_EVENT } from '@/components/footer'; // Import the event name

export function ClientProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load products from the database
  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Loading products from database...');
      
      const [allProducts, featured] = await Promise.all([
        getAllProducts(),
        getFeaturedProducts()
      ]);
      
      console.log(`Loaded ${allProducts.length} products, ${featured.length} featured products`);
      setProducts(allProducts);
      setFeaturedProducts(featured);
      setLoading(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(`Failed to load products: ${String(err)}`);
      setLoading(false);
    }
  };

  // Load products on initial mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Listen for refresh events
  useEffect(() => {
    const handleDatabaseRefresh = () => {
      console.log('🔄 ClientProducts: Refreshing product data after DB reset');
      loadProducts();
    };

    window.addEventListener(DB_REFRESH_EVENT, handleDatabaseRefresh);
    
    return () => {
      window.removeEventListener(DB_REFRESH_EVENT, handleDatabaseRefresh);
    };
  }, []);

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 text-xl">Error loading products</div>
        <div className="mt-2">{error}</div>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Featured Error Fixes</h2>
            <p className="text-gray-600 mb-6">Loading featured products...</p>
            <FeaturedProductsSkeleton />
          </div>
          <div className="mt-16">
            <h2 className="text-4xl font-bold tracking-tight mb-8 text-red-500">All Error Solutions</h2>
            <ProductGridSkeleton />
          </div>
        </>
      ) : (
        <>
          <FeaturedCollection 
            title="Featured Error Fixes" 
            description="Premium solutions for those pesky bugs that keep your PR queue backed up"
            products={featuredProducts}
          />
          <div className="container">
            <h2 className="text-4xl font-bold tracking-tight mb-8 text-red-500">All Error Solutions</h2>
            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <p className="text-center py-10 text-gray-500">No products found</p>
            )}
          </div>
        </>
      )}
    </>
  );
} 