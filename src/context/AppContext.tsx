
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session on load
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
          
          // Fetch user profile
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData && !error) {
            setProfile(profileData);
          }
          
          // Load cart from localStorage
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
          
          // Fetch or create user profile
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData && !error) {
            setProfile(profileData);
          } else {
            // Create profile if doesn't exist
            await supabase.from('profiles').insert([
              { id: session.user.id, email: session.user.email }
            ]);
            
            setProfile({
              id: session.user.id,
            });
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('decorbyte_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number) => {
    if (product.inventory < quantity) {
      toast({
        title: "Insufficient stock",
        description: "We don't have that many items in stock.",
        variant: "destructive"
      });
      return;
    }
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Check if there's enough inventory for the update
        const newQuantity = prevCart[existingItemIndex].quantity + quantity;
        
        if (newQuantity > product.inventory) {
          toast({
            title: "Insufficient stock",
            description: "We don't have that many items in stock.",
            variant: "destructive"
          });
          return prevCart;
        }
        
        // Update existing item
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
        // Add new item
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
      
      // Check inventory
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
        // Remove item if quantity is 0 or negative
        return prevCart.filter(item => item.product.id !== productId);
      }
      
      // Update quantity
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

  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity, 
    0
  );
  
  // Calculate total items in cart
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
