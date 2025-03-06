'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { getProductById, getAllProducts } from '@/lib/db/repositories/ProductRepository';
import { ProductDetails } from '@/components/product-details';
import { ProductRecommendations } from '@/components/product-recommendations';
import { notFound } from 'next/navigation';
import { DB_REFRESH_EVENT } from '@/components/footer'; // Import the event name

interface ClientProductDetailProps {
  productId: string;
}

export function ClientProductDetail({ productId }: ClientProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load product data
  const loadProductData = async () => {
    try {
      setLoading(true);
      console.log(`Loading product ${productId} from database...`);
      
      // Fetch the product and all products for related items
      const productData = await getProductById(productId);
      
      if (!productData) {
        notFound();
        return;
      }
      
      const allProducts = await getAllProducts();
      
      setProduct(productData);
      
      // Filter related products by category
      const related = allProducts
        .filter(p => p.category === productData.category && p.id !== productData.id)
        .slice(0, 4);
        
      setRelatedProducts(related);
      setLoading(false);
    } catch (err) {
      console.error(`Error loading product ${productId}:`, err);
      setError(`Failed to load product: ${String(err)}`);
      setLoading(false);
    }
  };

  // Load product data on initial mount or productId change
  useEffect(() => {
    loadProductData();
  }, [productId]);

  // Listen for refresh events
  useEffect(() => {
    const handleDatabaseRefresh = () => {
      console.log('🔄 ClientProductDetail: Refreshing product data after DB reset');
      loadProductData();
    };

    window.addEventListener(DB_REFRESH_EVENT, handleDatabaseRefresh);
    
    return () => {
      window.removeEventListener(DB_REFRESH_EVENT, handleDatabaseRefresh);
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-8" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-8 bg-gray-200 rounded w-1/6 mt-8" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className="container py-10 space-y-16">
      <ProductDetails product={product} />
      {relatedProducts.length > 0 && (
        <ProductRecommendations products={relatedProducts} />
      )}
    </div>
  );
} 