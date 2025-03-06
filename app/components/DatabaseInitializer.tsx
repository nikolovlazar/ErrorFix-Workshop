'use client';

import { useEffect, useState } from 'react';
import { getDB } from '@/lib/db/client';
import { sql } from 'drizzle-orm';

// Event name for database ready
export const DB_READY_EVENT = 'database_ready';

// Function to dispatch database ready event
export function dispatchDatabaseReadyEvent(productCount: number) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(DB_READY_EVENT, { detail: { productCount } });
    window.dispatchEvent(event);
    console.log(`✅ DatabaseInitializer: Dispatched DB_READY_EVENT with ${productCount} products`);
  }
}

export function DatabaseInitializer() {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const initializeDB = async () => {
      try {
        console.log('🔄 DatabaseInitializer: Initializing database...');
        setLoading(true);
        
        const db = await getDB();
        if (!db) {
          console.error('❌ DatabaseInitializer: db is null after getDB()');
          if (isMounted) {
            setError('Database initialization failed: db is null');
            setInitialized(false);
            setLoading(false);
          }
          return;
        }
        
        console.log('✅ DatabaseInitializer: Database connection established');
        
        // Test query to ensure the products table exists and count products
        try {
          const result = await db.execute(sql`SELECT COUNT(*) FROM products`);
          const count = parseInt(String(result.rows?.[0]?.count || '0'), 10);
          
          if (isMounted) {
            console.log(`✅ DatabaseInitializer: Found ${count} products in database`);
            setProductCount(count);
            
            // Dispatch event that database is ready with product count
            dispatchDatabaseReadyEvent(count);
          }
        } catch (countError) {
          console.error('❌ DatabaseInitializer: Error counting products:', countError);
          if (isMounted) {
            setError('Error counting products. Table may not exist yet.');
          }
        }
        
        if (isMounted) {
          setInitialized(true);
          setLoading(false);
          console.log('✅ DatabaseInitializer: Database initialization complete');
        }
      } catch (initError) {
        console.error('❌ DatabaseInitializer: Initialization error:', initError);
        if (isMounted) {
          setError(`Database initialization error: ${String(initError)}`);
          setInitialized(false);
          setLoading(false);
        }
      }
    };

    initializeDB();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded">Error: {error}</div>;
  }
} 