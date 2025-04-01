
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

export const createOrder = async (orderData: any) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select();
  return { data, error };
};

export const createOrderItems = async (orderItems: any[]) => {
  const { data, error } = await supabase
    .from('order_items')
    .insert(orderItems);
  return { data, error };
};

export const getUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
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
