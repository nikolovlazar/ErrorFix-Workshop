import { NextResponse } from 'next/server';

// Server-side configuration - expects standard Authorization header
const SERVER_AUTH_CONFIG = {
  expectedAuthHeaderName: 'Authorization', // Server expects standard 'Authorization' header
  expectedAuthPrefix: 'Basic',
  idGenerationMethod: 'legacy',
  tokenExpirySeconds: 3600,
  validateEmail: true,
  minPasswordLength: 8
};

export async function POST(request: Request) {
  try {
    const allHeaders = Object.fromEntries(request.headers.entries());
    const authHeader = request.headers.get(SERVER_AUTH_CONFIG.expectedAuthHeaderName);
    const wrongAuthHeader = request.headers.get('authentication');

    if (!authHeader && wrongAuthHeader) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          message: 'Invalid authentication credentials',
          code: 'AUTH_FAILED'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

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

    let userId;

    switch (SERVER_AUTH_CONFIG.idGenerationMethod) {
      case 'standard':
        userId = Math.random().toString(36).substring(2, 15);
        break;
      case 'legacy':
        userId = `legacy-${Math.random().toString(36).substring(2, 5)}`;
        break;
      case 'uuid':
        userId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        break;
      default:
        userId = `user-${Math.random().toString(36).substring(2, 10)}`;
    }

    const user = {
      id: userId,
      email,
      name: email.split('@')[0],
    };

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Login API error:', error);

    return NextResponse.json(
      {
        error: 'Authentication failed',
        message: 'An error occurred during the authentication process',
        code: 'AUTH_ERROR'
      },
      { status: 500 }
    );
  }
}