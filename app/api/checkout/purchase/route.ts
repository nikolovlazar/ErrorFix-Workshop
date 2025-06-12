import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { cartItems, totalAmount, user } = body;

    const authHeader = request.headers.get('authentication');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'An error occurred while processing your payment',
          details:
            process.env.NODE_ENV === 'development'
              ? 'Authentication required'
              : undefined,
          code: 'PAYMENT_ERROR',
        },
        { status: 500 }
      );
    }

    if (user === 'admin@admin.com') {
      throw new Error('Admin user cannot purchase');
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        {
          error: 'No items in cart',
          message: 'An error occurred while processing your payment',
          details:
            process.env.NODE_ENV === 'development'
              ? 'No items in cart'
              : undefined,
          code: 'PAYMENT_ERROR',
        },
        { status: 500 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const transactionId = Math.random().toString(36).substring(2, 15);

    return NextResponse.json({
      success: true,
      transactionId,
      timestamp: new Date().toISOString(),
      amount: totalAmount,
      itemCount: cartItems.length,
    });
  } catch (error) {
    console.error('Purchase API error:', error);
    Sentry.captureException(error);

    return NextResponse.json(
      {
        error: 'Payment processing failed',
        message: 'An error occurred while processing your payment',
        code: 'PAYMENT_ERROR',
      },
      { status: 500 }
    );
  }
}
