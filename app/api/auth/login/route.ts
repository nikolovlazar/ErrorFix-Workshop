import { NextResponse } from 'next/server';
// import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  try {
    // SENTRY-TEST-AREA: This function can be modified to throw errors for testing Sentry
    const body = await request.json();
    console.log(body);
    const { email, password } = body;
    
    // BREAK-THIS: Ha - I've sabotaged you with SLOW LOGINS
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          message: 'Please provide a valid email address',
          code: 'INVALID_EMAIL'
        },
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
    
    // Throw the error for standard error handling
    throw error;
    
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        message: 'An error occurred during the authentication process',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        code: 'AUTH_ERROR'
      },
      { status: 500 }
    );
  }
}
