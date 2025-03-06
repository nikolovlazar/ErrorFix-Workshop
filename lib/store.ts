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

// This will be the area where we'll introduce errors for Sentry testing
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

// Function to reset all application state
export const resetAppState = () => {
  // Clear cart data from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart');
  }
};

interface PurchaseState {
  processingPurchase: boolean;
  purchaseComplete: boolean;
  purchaseError: string | null;
  makePurchase: (paymentDetails: any) => Promise<{ success: boolean; error?: string }>;
  resetPurchaseState: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          const user = await authenticateUser(email, password);
          
          if (user) {
            set({ user, isAuthenticated: true });
            return { success: true };
          } else {
            return { 
              success: false, 
              error: 'Invalid email or password. Please try again.' 
            };
          }
        } catch (error) {
          console.error('Login error:', error);
          return { 
            success: false, 
            error: 'An error occurred during login. Please try again.' 
          };
        }
      },
      
      logout: () => {
        // Reset auth state
        set({ user: null, isAuthenticated: false });
        
        // Reset all application state
        resetAppState();
        
        // We'll reset purchase state after it's defined
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
    
    makePurchase: async (paymentDetails: any) => {
      set({ processingPurchase: true, purchaseError: null });
      
      try {
        // Get auth data from the auth store
        const authState = useAuthStore.getState();
        
        // BROKEN-THIS by changing the endpoint
        const response = await fetch('/api/checkout/purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add Authorization header if authenticated
            ...(authState.isAuthenticated && authState.user 
              ? { 'Authorization': `Bearer ${authState.user.id}` } 
              : {})
          },
          body: JSON.stringify(paymentDetails),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          // Handle authentication errors
          if (response.status === 401) {
            set({ 
              processingPurchase: false,
              purchaseError: 'Authentication required. Please log in to complete your purchase.'
            });
            
            return { 
              success: false, 
              error: 'Authentication required. Please log in to complete your purchase.' 
            };
          }
          
          // Handle other errors
          set({ 
            processingPurchase: false,
            purchaseError: data.error || 'An error occurred while processing your payment.'
          });
          
          return { 
            success: false, 
            error: data.error || 'Payment processing failed. Please try again.' 
          };
        }
        
        // Handle successful purchase
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
