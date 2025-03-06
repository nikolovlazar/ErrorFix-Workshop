'use client';

import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/components/cart-item';
import { CartSummary } from '@/components/cart-summary';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, totalPrice } = useCart();
  
  if (items.length === 0) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-primary">Your cart is empty</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8 text-blue-500">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={`${item.id}-${item.selectedSize}`} item={item} />
          ))}
        </div>
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}