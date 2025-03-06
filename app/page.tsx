import { Suspense } from 'react';
import { Hero } from '@/components/hero';
import { DatabaseInitializer } from '@/app/components/DatabaseInitializer';
import { ClientProducts } from '@/app/components/ClientProducts';

export default function Home() {
  return (
    <div className="space-y-16 pb-16">
      {/* Initializes the database on client side */}
      <DatabaseInitializer />
      <Hero />
      <Suspense>
        <ClientProducts />
      </Suspense>
    </div>
  );
}