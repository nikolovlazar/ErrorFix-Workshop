import { Suspense } from 'react';
import { ClientProductDetail } from '@/app/components/ClientProductDetail';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';

interface ProductPageProps {
  params: {
    id: string;
  };
}

async function getAllProducts() {
  return await db.select().from(products);
}

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products.map((product) => ({
      id: product.id.toString(),
    }));
  } catch (error) {
    console.warn('Could not generate static params:', error);
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return (
    <>
      <Suspense fallback={<div className="container py-10">Loading product...</div>}>
        <ClientProductDetail productId={id} />
      </Suspense>
    </>
  );
}
