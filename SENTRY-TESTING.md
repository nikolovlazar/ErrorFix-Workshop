# Sentry Error Monitoring Testing Guide

This document outlines how to test Sentry error monitoring with the ErrorFix application. The application has been designed with specific areas marked for introducing errors to test Sentry's capabilities.

## Marked Areas for Testing

Throughout the codebase, you'll find comments labeled with `SENTRY-TEST-AREA`. These indicate sections where you can introduce errors to test Sentry's monitoring capabilities.

### Authentication Testing

1. **Client-Side Authentication**
   - File: `lib/store.ts`
   - Function: `authenticateUser`
   - Possible modifications:
     ```typescript
     // Original code
     const authenticateUser = async (email: string, password: string): Promise<User | null> => {
       try {
         // Simulate API call
         await new Promise(resolve => setTimeout(resolve, 800));
         
         // Simple validation - any password works, but email must be valid format
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(email)) {
           return null;
         }
         
         // Create a user object based on the email
         return {
           id: Math.random().toString(36).substring(2, 15),
           email,
           name: email.split('@')[0]
         };
       } catch (error) {
         console.error('Authentication error:', error);
         return null;
       }
     };
     
     // Modified for Sentry testing
     const authenticateUser = async (email: string, password: string): Promise<User | null> => {
       // Simulate API call
       await new Promise(resolve => setTimeout(resolve, 800));
       
       // Throw an error to test Sentry
       throw new Error("Authentication service unavailable");
       
       // The code below will never execute due to the error
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(email)) {
         return null;
       }
       
       return {
         id: Math.random().toString(36).substring(2, 15),
         email,
         name: email.split('@')[0]
       };
     };
     ```

2. **Server-Side Authentication**
   - File: `app/api/auth/login/route.ts`
   - Function: `POST`
   - Possible modifications:
     ```typescript
     // Original code
     export async function POST(request: Request) {
       try {
         const body = await request.json();
         const { email, password } = body;
         
         // Simulate API processing time
         await new Promise(resolve => setTimeout(resolve, 800));
         
         // Simple validation - any password works, but email must be valid format
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(email)) {
           return NextResponse.json(
             { error: 'Invalid email format' },
             { status: 400 }
           );
         }
         
         // Create a user object based on the email
         const user = {
           id: Math.random().toString(36).substring(2, 15),
           email,
           name: email.split('@')[0],
         };
         
         return NextResponse.json({ user });
       } catch (error) {
         console.error('Login API error:', error);
         return NextResponse.json(
           { error: 'Authentication failed' },
           { status: 500 }
         );
       }
     }
     
     // Modified for Sentry testing
     export async function POST(request: Request) {
       // Simulate API processing time
       await new Promise(resolve => setTimeout(resolve, 800));
       
       // Throw an error to test Sentry
       throw new Error("Authentication API failure");
       
       // The code below will never execute due to the error
       try {
         const body = await request.json();
         const { email, password } = body;
         
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(email)) {
           return NextResponse.json(
             { error: 'Invalid email format' },
             { status: 400 }
           );
         }
         
         const user = {
           id: Math.random().toString(36).substring(2, 15),
           email,
           name: email.split('@')[0],
         };
         
         return NextResponse.json({ user });
       } catch (error) {
         console.error('Login API error:', error);
         return NextResponse.json(
           { error: 'Authentication failed' },
           { status: 500 }
         );
       }
     }
     ```

### Purchase Testing

1. **Client-Side Purchase**
   - File: `lib/store.ts`
   - Function: `makePurchase` in `usePurchaseStore`
   - Possible modifications:
     ```typescript
     // Original code
     makePurchase: async (paymentDetails: any) => {
       set({ processingPurchase: true, purchaseError: null });
       
       try {
         // Simulate API call to process payment
         await new Promise(resolve => setTimeout(resolve, 1500));
         
         // Simulate successful purchase
         set({ 
           processingPurchase: false, 
           purchaseComplete: true 
         });
         
         return { success: true };
       } catch (error) {
         console.error('Purchase error:', error);
         set({ 
           processingPurchase: false,
           purchaseError: 'An error occurred while processing your payment. Please try again.'
         });
         
         return { 
           success: false, 
           error: 'Payment processing failed. Please try again.' 
         };
       }
     }
     
     // Modified for Sentry testing
     makePurchase: async (paymentDetails: any) => {
       set({ processingPurchase: true, purchaseError: null });
       
       // Simulate API call to process payment
       await new Promise(resolve => setTimeout(resolve, 1500));
       
       // Throw an error to test Sentry
       throw new Error("Payment processing service unavailable");
       
       // The code below will never execute due to the error
       try {
         set({ 
           processingPurchase: false, 
           purchaseComplete: true 
         });
         
         return { success: true };
       } catch (error) {
         console.error('Purchase error:', error);
         set({ 
           processingPurchase: false,
           purchaseError: 'An error occurred while processing your payment. Please try again.'
         });
         
         return { 
           success: false, 
           error: 'Payment processing failed. Please try again.' 
         };
       }
     }
     ```

2. **Server-Side Purchase**
   - File: `app/api/checkout/purchase/route.ts`
   - Function: `POST`
   - Possible modifications:
     ```typescript
     // Original code
     export async function POST(request: Request) {
       try {
         const body = await request.json();
         const { items, paymentDetails, totalAmount } = body;
         
         // Validate request
         if (!items || !Array.isArray(items) || items.length === 0) {
           return NextResponse.json(
             { error: 'No items in cart' },
             { status: 400 }
           );
         }
         
         if (!paymentDetails || !totalAmount) {
           return NextResponse.json(
             { error: 'Missing payment details or total amount' },
             { status: 400 }
           );
         }
         
         // Simulate payment processing time
         await new Promise(resolve => setTimeout(resolve, 1500));
         
         // Generate a transaction ID
         const transactionId = Math.random().toString(36).substring(2, 15);
         
         return NextResponse.json({
           success: true,
           transactionId,
           timestamp: new Date().toISOString(),
           amount: totalAmount,
           itemCount: items.length
         });
       } catch (error) {
         console.error('Purchase API error:', error);
         return NextResponse.json(
           { error: 'Payment processing failed' },
           { status: 500 }
         );
       }
     }
     
     // Modified for Sentry testing
     export async function POST(request: Request) {
       // Simulate payment processing time
       await new Promise(resolve => setTimeout(resolve, 1500));
       
       // Throw an error to test Sentry
       throw new Error("Payment gateway connection failure");
       
       // The code below will never execute due to the error
       try {
         const body = await request.json();
         const { items, paymentDetails, totalAmount } = body;
         
         if (!items || !Array.isArray(items) || items.length === 0) {
           return NextResponse.json(
             { error: 'No items in cart' },
             { status: 400 }
           );
         }
         
         if (!paymentDetails || !totalAmount) {
           return NextResponse.json(
             { error: 'Missing payment details or total amount' },
             { status: 400 }
           );
         }
         
         const transactionId = Math.random().toString(36).substring(2, 15);
         
         return NextResponse.json({
           success: true,
           transactionId,
           timestamp: new Date().toISOString(),
           amount: totalAmount,
           itemCount: items.length
         });
       } catch (error) {
         console.error('Purchase API error:', error);
         return NextResponse.json(
           { error: 'Payment processing failed' },
           { status: 500 }
         );
       }
     }
     ```

## Testing Procedure

1. Set up Sentry in your Next.js application following the official documentation.
2. Choose one of the test areas mentioned above and modify the code to introduce the error.
3. Interact with the application to trigger the error:
   - For authentication errors: Try to log in
   - For purchase errors: Add items to cart and proceed to checkout
4. Check your Sentry dashboard to verify that the error was captured correctly.
5. Verify that the error details, stack trace, and context information are properly displayed.

## Additional Testing Ideas

- Test different types of errors (syntax errors, network errors, promise rejections)
- Test errors with different severity levels
- Test errors with custom context information
- Test errors with user information attached
