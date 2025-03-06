'use client';

import Link from 'next/link';
import { Bug, Instagram, Twitter, Facebook } from 'lucide-react';
import { DB_SEEDING_ENABLED_KEY } from '@/lib/db/migrations/001_seed_products';
import { sql } from 'drizzle-orm';

// Event name for database refresh
export const DB_REFRESH_EVENT = 'database_refresh';

// Function to dispatch database refresh event
export function dispatchDatabaseRefreshEvent() {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(DB_REFRESH_EVENT);
    window.dispatchEvent(event);
    console.log('🔄 Dispatched DB_REFRESH_EVENT');
  }
}

export default function Footer() {
  const handleRefundPolicyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      console.log('🔄 Clearing database...');
      
      // First try the API route
      try {
        const response = await fetch('/api/db/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('API response:', await response.json());
      } catch (apiError) {
        console.log('API route failed, falling back to client-side reset:', apiError);
      }
      
      // Whether the API succeeded or failed, we'll also reset directly on the client
      // This ensures the database is reset even if the API can't access it
      try {
        const { getDB } = await import('@/lib/db/client');
        const db = await getDB();
        
        if (!db) {
          console.error('Database client is null');
          throw new Error('Database client is null');
        }
        
        console.log('Executing DELETE FROM products');
        await db.execute(sql`DELETE FROM "products"`);
        console.log('✅ Database cleared successfully on client side');
        
        alert('Database cleared successfully. Seeding will depend on your command menu setting.');
        
        // Dispatch event to refresh product data
        dispatchDatabaseRefreshEvent();
      } catch (dbError) {
        console.error('Error clearing database on client side:', dbError);
        throw dbError;
      }
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      alert(`Error clearing database: ${String(error)}`);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Bug className="h-6 w-6 text-red-500" />
              <span className="text-xl font-bold">ErrorFix</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Premium solutions for your most frustrating development errors.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products/1" className="text-gray-400 hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Featured Solutions</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li>
                <a href="#" onClick={handleRefundPolicyClick} className="text-gray-400 hover:text-white transition-colors">
                  Refund Policy
                </a>
              </li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ErrorFix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}