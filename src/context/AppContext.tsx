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
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
          
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
          
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData && !error) {
            setProfile(profileData);
          } else {
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
