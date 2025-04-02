
import { createClient } from '@supabase/supabase-js';

// Import the client configuration from our integration file
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Re-export the preconfigured client
export const supabase = supabaseClient;

// Auth helpers
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // In development, we can bypass the email confirmation
      emailRedirectTo: window.location.origin,
      data: {
        // Optional user metadata
      }
    }
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Database interactions
export const getProductsByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('active', true);
  return { data, error };
};

export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true);
  return { data, error };
};

export const getProduct = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

export const createOrUpdateUserProfile = async (userData: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert([userData])
    .select();
  return { data, error };
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

// Update the createOrder function to handle inventory updates
export const createOrder = async (orderData: any) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select();
  return { data, error };
};

// Update the createOrderItems function to handle inventory updates
export const createOrderItems = async (orderItems: any[]) => {
  const { data, error } = await supabase
    .from('order_items')
    .insert(orderItems);
    
  // If order items were successfully created, update product inventory
  if (!error && orderItems.length > 0) {
    // For each item, reduce the inventory
    for (const item of orderItems) {
      // Get current product
      const { data: product } = await supabase
        .from('products')
        .select('inventory')
        .eq('id', item.product_id)
        .single();
      
      if (product) {
        // Calculate new inventory
        const newInventory = Math.max(0, product.inventory - item.quantity);
        
        // Update inventory
        await supabase
          .from('products')
          .update({ inventory: newInventory })
          .eq('id', item.product_id);
      }
    }
  }
  
  return { data, error };
};

export const getUserOrders = async (userId: string) => {
  console.log(`Fetching orders for user ID: ${userId}`);
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  console.log('User orders query result:', { data, error });
  return { data, error };
};

export const addToWishlist = async (userId: string, productId: string) => {
  const { data, error } = await supabase
    .from('wishlists')
    .insert([{ user_id: userId, product_id: productId }]);
  return { data, error };
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  const { data, error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  return { data, error };
};

export const getUserWishlist = async (userId: string) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*, products(*)')
    .eq('user_id', userId);
  return { data, error };
};
