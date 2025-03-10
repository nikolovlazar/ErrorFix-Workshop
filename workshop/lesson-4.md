# Lesson 4: Debugging Cart Issues with Sentry

## Problem Description
The checkout process is failing because the server thinks the cart is empty, even though the client is sending items. This is happening because of a variable name mismatch between client and server.

## Root Cause
- Client sends cart data using the property name `items`
- Server expects the data using the property name `cartContents`
- This mismatch causes the server to think the cart is empty

## Current Configurations Backup

### app/checkout/page.tsx (handleSubmit function)
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Prevent checkout if not authenticated
  if (!isAuthenticated) {
    setIsLoginOpen(true);
    return;
  }
  
  // SENTRY-TEST-AREA: This function call can be modified to test Sentry error monitoring
  try {
    const result = await makePurchase({
      items,
      totalAmount: totalPrice
    });
    
    if (result.success) {
      clearCart();
    }
  } catch (error) {
    console.error('Checkout error:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred during checkout.",
      variant: "destructive"
    });
  }
};
```

### lib/store.ts (makePurchase function)
```typescript
makePurchase: async (paymentDetails: { items: Array<{ id: string; price: number; name: string }>; totalAmount: number }) => {
  set({ processingPurchase: true, purchaseError: null });
  
  try {
    const authState = useAuthStore.getState();
    
    const response = await fetch('/api/checkout/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authState.isAuthenticated && authState.user 
          ? { [AUTH_CONFIG.authHeaderName]: `${AUTH_CONFIG.tokenPrefix} ${authState.user.id}` } 
          : {})
      },
      body: JSON.stringify(paymentDetails),
    });
  
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred during checkout.');
    }
    
    set({ 
      processingPurchase: false, 
      purchaseComplete: true 
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Purchase error:', error);
    set({ 
      processingPurchase: false,
      purchaseError: error.message || 'Payment processing failed'
    });
    
    return { 
      success: false, 
      error: error.message || 'Payment processing failed. Please try again.' 
    };
  }
},
```

### app/api/checkout/purchase/route.ts
```typescript
import { NextResponse } from 'next/server';

// API validation configuration - this would typically be in a shared config
const API_VALIDATION = {
  // Server side expects Authorization header
  expectedAuthHeaderName: 'Authorization',
  expectedTokenPrefix: 'Bearer',
  validateTokenFormat: false, // Disable token format validation
  securityLevel: 'high'
};

export async function POST(request: Request) {
  try {
    
    const body = await request.json();
    
    // Extract cart data from request body
    const { items: cartContents, paymentDetails, totalAmount } = body;
    
    // Check auth header (simplified, no token validation)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {

      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'You must provide a valid authentication token',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }
    
    if (!cartContents || !Array.isArray(cartContents) || cartContents.length === 0) {

      return NextResponse.json(
        { 
          error: 'No items in cart',
          message: 'Your cart is empty. Please add items before checkout',
          code: 'EMPTY_CART'
        },
        { status: 400 }
      );
    }
      
    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const transactionId = Math.random().toString(36).substring(2, 15);
    
    return NextResponse.json({
      success: true,
      transactionId,
      timestamp: new Date().toISOString(),
      amount: totalAmount,
      itemCount: cartContents.length
    });
  } catch (error) {
    console.error('Purchase API error:', error);
    


    return NextResponse.json(
      { 
        error: 'Payment processing failed',
        message: 'An error occurred while processing your payment',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        code: 'PAYMENT_ERROR'
      },
      { status: 500 }
    );
  }
}
```

## New Configs

### 1. Client-side Breadcrumb in app/checkout/page.tsx
```tsx
// Inside handleSubmit function, before makePurchase call
Sentry.addBreadcrumb({
  category: 'checkout',
  message: `Attempting checkout with ${items.length} items`,
  level: 'info',
  data: {
    itemCount: items.length,
    itemDetails: items.map(item => ({ id: item.id, name: item.name, price: item.price })),
    totalAmount: totalPrice
  }
});
```

### 2. Client-side Span in lib/store.ts (makePurchase function)
```typescript
makePurchase: async (paymentDetails: { items: Array<{ id: string; price: number; name: string }>; totalAmount: number }) => {
  set({ processingPurchase: true, purchaseError: null });
  
  return await Sentry.startSpan(
    {
      name: "Client Purchase Request",
      op: "purchase.client",
      attributes: {
        "cart.items.count": paymentDetails.items.length,
        "cart.total_amount": paymentDetails.totalAmount,
        "cart.items": JSON.stringify(paymentDetails.items.map(item => ({ id: item.id, name: item.name, price: item.price })))
      }
    },
    async () => {
      try {
        const authState = useAuthStore.getState();
        
        const response = await fetch('/api/checkout/purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authState.isAuthenticated && authState.user 
              ? { [AUTH_CONFIG.authHeaderName]: `${AUTH_CONFIG.tokenPrefix} ${authState.user.id}` } 
              : {})
          },
          body: JSON.stringify(paymentDetails),
        });
      
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'An error occurred during checkout.');
        }
        
        set({ 
          processingPurchase: false, 
          purchaseComplete: true 
        });
        
        return { success: true };
      } catch (error: any) {
        console.error('Purchase error:', error);
        set({ 
          processingPurchase: false,
          purchaseError: error.message || 'Payment processing failed'
        });
        
        return { 
          success: false, 
          error: error.message || 'Payment processing failed. Please try again.' 
        };
      }
    }
  );
},
```

### 3. Server-side Span in app/api/checkout/purchase/route.ts
```typescript
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

// API validation configuration - this would typically be in a shared config
const API_VALIDATION = {
  // Server side expects Authorization header
  expectedAuthHeaderName: 'Authorization',
  expectedTokenPrefix: 'Bearer',
  validateTokenFormat: false, // Disable token format validation
  securityLevel: 'high'
};

export async function POST(request: Request) {
  return Sentry.startSpan(
    {
      name: "Server Purchase Processing",
      op: "purchase.server",
    },
    async () => {
      try {
        const body = await request.json();
        
        // Extract cart data from request body
        const { items: cartContents, paymentDetails, totalAmount } = body;
        
        // Add span attributes to track the values
        Sentry.setSpanAttribute("cart.raw_body", JSON.stringify(body));
        Sentry.setSpanAttribute("cart.has_items_property", body.hasOwnProperty('items'));
        Sentry.setSpanAttribute("cart.items_value", body.items ? JSON.stringify(body.items) : "undefined");
        Sentry.setSpanAttribute("cart.received_items", cartContents ? JSON.stringify(cartContents) : "undefined");
        Sentry.setSpanAttribute("cart.received_items_count", cartContents ? (Array.isArray(cartContents) ? cartContents.length : 0) : 0);
        Sentry.setSpanAttribute("cart.total_amount", totalAmount);
        
        // Check auth header (simplified, no token validation)
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          Sentry.setSpanAttribute("auth.error", "missing_or_invalid_auth_header");
          
          return NextResponse.json(
            { 
              error: 'Authentication required',
              message: 'You must provide a valid authentication token',
              code: 'AUTH_REQUIRED'
            },
            { status: 401 }
          );
        }
        
        if (!cartContents || !Array.isArray(cartContents) || cartContents.length === 0) {
          Sentry.setSpanAttribute("cart.error", "empty_cart");
          Sentry.setSpanAttribute("cart.validation_details", JSON.stringify({
            cartContents_exists: !!cartContents,
            isArray: Array.isArray(cartContents),
            length: cartContents ? cartContents.length : 0
          }));
          
          return NextResponse.json(
            { 
              error: 'No items in cart',
              message: 'Your cart is empty. Please add items before checkout',
              code: 'EMPTY_CART'
            },
            { status: 400 }
          );
        }
          
        // Simulate payment processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const transactionId = Math.random().toString(36).substring(2, 15);
        Sentry.setSpanAttribute("transaction.id", transactionId);
        Sentry.setSpanAttribute("transaction.amount", totalAmount);
        Sentry.setSpanAttribute("transaction.item_count", cartContents.length);
        
        return NextResponse.json({
          success: true,
          transactionId,
          timestamp: new Date().toISOString(),
          amount: totalAmount,
          itemCount: cartContents.length
        });
      } catch (error) {
        console.error('Purchase API error:', error);
        Sentry.captureException(error);
        
        return NextResponse.json(
          { 
            error: 'Payment processing failed',
            message: 'An error occurred while processing your payment',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            code: 'PAYMENT_ERROR'
          },
          { status: 500 }
        );
      }
    }
  );
}
```

## Current Broken Configuration

We've updated our Sentry instrumentation to help debug the checkout issue. Here's the current state with the intentional bug still in place:

### Server-side API Route with Improved Sentry Instrumentation

```typescript
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

// API validation configuration - this would typically be in a shared config
const API_VALIDATION = {
  // Server side expects Authorization header
  expectedAuthHeaderName: 'Authorization',
  expectedTokenPrefix: 'Bearer',
  validateTokenFormat: false, // Disable token format validation
  securityLevel: 'high'
};

export async function POST(request: Request) {
  try {
    return await Sentry.startSpan(
      {
        name: "Purchase API Request",
        op: "errorfix.purchase.api",
        attributes: {
          "authHeaderExpected.property": API_VALIDATION.expectedAuthHeaderName,
          "http.method": "POST",
          "http.route": "/api/checkout/purchase"
        }
      },
      async (span) => {
        const body = await request.json();
        
        // Extract cart data from request body
        // Intentionally using a different variable name (cartItems) than what the client sends (items)
        // This creates a bug where the server expects 'cartItems' but the client sends 'items'
        const { cartItems, paymentDetails, totalAmount } = body;
        
        // Add span attributes to track the values
        span.setAttributes({
          "cart.raw_body": JSON.stringify(body),
          "cart.has_items_property": body.hasOwnProperty('items'),
          "cart.items_value": body.items ? JSON.stringify(body.items) : "undefined",
          "cart.received_items": cartItems ? JSON.stringify(cartItems) : "undefined",
          "cart.received_items_count": cartItems ? (Array.isArray(cartItems) ? cartItems.length : 0) : 0,
          "cart.total_amount": totalAmount
        });
        
        // Rest of the function...
      }
    );
  } catch (error) {
    // Error handling...
  }
}
```

## Expected Behavior
1. User adds items to cart (captured in breadcrumb)
2. User attempts checkout
3. Client sends data with `items` property (captured in client span)
4. Server looks for `cartItems` property (captured in server span)
5. Server returns "Empty Cart" error
6. Sentry shows the complete flow and helps identify the variable mismatch

## How to Debug with Sentry

With our improved Sentry instrumentation, we can now effectively debug the checkout issue:

1. Look at the breadcrumb to confirm items were added to cart
2. Check the client span to verify items were sent with the property name `items`
3. Check the server span to see:
   - `cart.has_items_property` is `true` (confirming the request body has an `items` property)
   - `cart.items_value` contains the actual items (showing the data was received correctly)
   - `cart.received_items` is `undefined` (showing the server couldn't find `cartItems`)
   - `cart.received_items_count` is `0` (confirming no items were found)
   - `cart.error` is `empty_cart` (showing the error that occurred)
   - `cart.validation_details` shows that `cartItems_exists` is `false`

This clearly reveals the root cause: the server is looking for a property named `cartItems` but the client is sending data with a property named `items`.

## Solution

To fix the variable name mismatch, we need to update the server-side code to use the correct property name. Here's the solution:

```typescript
// Extract cart data from request body
// Fix: Use 'items' instead of 'cartItems' to match what the client sends
const { items, paymentDetails, totalAmount } = body;
```

This change ensures that the server correctly extracts the cart items from the request body using the same property name that the client is using.

## Verification

After making this change, we can verify the fix works by:

1. Attempting a checkout with items in the cart
2. Checking the Sentry spans to confirm:
   - `cart.received_items_count` now shows the correct number of items
   - No `cart.error` is set
   - The transaction completes successfully

This demonstrates how Sentry instrumentation helps us identify and fix subtle bugs in our application's data flow.