
old verison - `/app/lib/store.ts`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// SENTRY-FIX: Authorization Header
const AUTH_CONFIG = {
  authHeaderName: 'Authorization', 
  tokenPrefix: 'Basic'
};

export const resetAppState = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart');
  }  
};

interface PurchaseState {
  processingPurchase: boolean;
  purchaseComplete: boolean;
  purchaseError: string | null;
  makePurchase: (paymentDetails: { items: Array<{ id: string; price: number; name: string }>; totalAmount: number }) => Promise<{ success: boolean; error?: string }>;
  resetPurchaseState: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          // Call the API login route instead of local authentication
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              [AUTH_CONFIG.authHeaderName]: `${AUTH_CONFIG.tokenPrefix} ${btoa(`${email}:${password}`)}`
            },
            body: JSON.stringify({ email, password }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Authentication failed');
          }
          
          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
            return { success: true };
          } else {
            return { 
              success: false, 
              error: 'Invalid email or password. Please try again.' 
            };
          }
        } catch (error: any) {
          console.error('Login error:', error);
          return { 
            success: false, 
            error: error.message || 'An error occurred during login. Please try again.' 
          };
        }
      },


      // End Login
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
        
        resetAppState();
        
        setTimeout(() => {
          usePurchaseStore.getState().resetPurchaseState();
        }, 0);
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const usePurchaseStore = create<PurchaseState>()(
  (set) => ({
    processingPurchase: false,
    purchaseComplete: false,
    purchaseError: null,
    
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
    
    resetPurchaseState: () => {
      set({ 
        processingPurchase: false,
        purchaseComplete: false,
        purchaseError: null
      });
    }
  })
);

```


Old version - `/api/auth/login/route.ts`

```javascript
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

    const wrongAuthHeader = request.headers.get('Authentication');

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
        break;
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
```