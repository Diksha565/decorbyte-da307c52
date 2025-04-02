
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Session } from '@supabase/supabase-js';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  inventory: number;
  active: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
};

type User = {
  id: string;
  email: string;
};

type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  phone?: string;
};

type AppContextType = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  totalItems: number;
  session: Session | null;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);
        setSession(newSession);
        
        if (newSession?.user) {
          setUser({
            id: newSession.user.id,
            email: newSession.user.email || '',
          });
          
          // Use setTimeout to avoid Supabase deadlocks
          setTimeout(async () => {
            try {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newSession.user.id)
                .single();
                
              if (profileData && !error) {
                setProfile(profileData);
              } else if (!error) {
                await supabase.from('profiles').insert([
                  { id: newSession.user.id, email: newSession.user.email }
                ]);
                
                setProfile({
                  id: newSession.user.id,
                });
              }
            } catch (err) {
              console.error('Error fetching profile:', err);
            }
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession?.user?.id);
        
        if (initialSession?.user) {
          setSession(initialSession);
          setUser({
            id: initialSession.user.id,
            email: initialSession.user.email || '',
          });
          
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();
            
          if (profileData && !error) {
            setProfile(profileData);
          }
          
          const savedCart = localStorage.getItem('decorbyte_cart');
          if (savedCart) {
            setCart(JSON.parse(savedCart));
          }
        }
      } catch (error) {
        console.error('Error loading auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('decorbyte_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number) => {
    if (product.inventory < quantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${product.inventory} items available.`,
        variant: "destructive"
      });
      return;
    }
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex !== -1) {
        const newQuantity = prevCart[existingItemIndex].quantity + quantity;
        
        if (newQuantity > product.inventory) {
          toast({
            title: "Insufficient stock",
            description: `Only ${product.inventory} items available. You already have ${prevCart[existingItemIndex].quantity} in your cart.`,
            variant: "destructive"
          });
          return prevCart;
        }
        
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newQuantity
        };
        
        toast({
          title: "Updated cart",
          description: `${product.name} quantity updated in cart.`,
        });
        
        return newCart;
      } else {
        toast({
          title: "Added to cart",
          description: `${product.name} added to your cart.`,
        });
        
        return [...prevCart, { id: product.id, product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.product.id !== productId);
      
      toast({
        title: "Removed from cart",
        description: "Item removed from your cart.",
      });
      
      return newCart;
    });
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id === productId);
      
      if (existingItemIndex === -1) return prevCart;
      
      const product = prevCart[existingItemIndex].product;
      if (quantity > product.inventory) {
        toast({
          title: "Insufficient stock",
          description: "We don't have that many items in stock.",
          variant: "destructive"
        });
        return prevCart;
      }
      
      if (quantity <= 0) {
        return prevCart.filter(item => item.product.id !== productId);
      }
      
      const newCart = [...prevCart];
      newCart[existingItemIndex] = {
        ...newCart[existingItemIndex],
        quantity
      };
      
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity, 
    0
  );
  
  const totalItems = cart.reduce(
    (total, item) => total + item.quantity, 
    0
  );

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        isLoading,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        cartTotal,
        totalItems,
        session,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
