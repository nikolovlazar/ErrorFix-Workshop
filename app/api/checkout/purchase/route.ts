import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  try {
    // SENTRY-TEST-AREA: This function can be modified to throw errors for testing Sentry
    const body = await request.json();
    const { items, paymentDetails, totalAmount } = body;
    
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
    
    const token = authHeader.substring(7); 

    if (!token) {
      return NextResponse.json(
        { 
          error: 'Invalid authentication',
          message: 'The provided authentication token is invalid',
          code: 'INVALID_TOKEN'
        },
        { status: 401 }
      );
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { 
          error: 'No items in cart',
          message: 'Your cart is empty. Please add items before checkout',
          code: 'EMPTY_CART'
        },
        { status: 400 }
      );
    }
    
    if (!paymentDetails || !totalAmount) {
      return NextResponse.json(
        { 
          error: 'Missing payment details or total amount',
          message: 'Payment details and total amount are required for checkout',
          code: 'MISSING_PAYMENT_INFO'
        },
        { status: 400 }
      );
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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

    // SENTRY-THIS: Cathing your exceptions!
    // Sentry.captureException(error);

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
