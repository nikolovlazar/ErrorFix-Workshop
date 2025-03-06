import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // SENTRY-TEST-AREA: This function can be modified to throw errors for testing Sentry
    const body = await request.json();
    console.log(body);
    const { email, password } = body;
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
