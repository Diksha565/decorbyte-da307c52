
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserWishlist } from '@/lib/supabase';
import { useApp, Product } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { removeFromWishlist } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products: Product;
};

const WishlistPage = () => {
  const { user, isLoading: userLoading, addToCart } = useApp();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await getUserWishlist(user.id);
      
      if (error) throw error;
      
      if (data) {
        setWishlistItems(data as WishlistItem[]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchWishlist();
    }
  }, [user, userLoading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/login', { state: { from: '/wishlist' } });
    }
  }, [user, userLoading, navigate]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;
    
    try {
      await removeFromWishlist(user.id, productId);
      setWishlistItems(wishlistItems.filter(item => item.product_id !== productId));
      
      toast({
        title: "Removed from wishlist",
        description: "The item has been removed from your wishlist."
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Action failed",
        description: "There was an error updating your wishlist.",
        variant: "destructive"
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`
    });
  };

  if (userLoading || (isLoading && user)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse space-y-4 w-full max-w-3xl">
              <div className="h-8 bg-secondary rounded w-1/3"></div>
              <div className="h-64 bg-secondary rounded w-full"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
          
          {wishlistItems.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-lg">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Save items you love to your wishlist and find them here later.</p>
              <Button onClick={() => navigate('/')}>
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={item.products.image_url} 
                      alt={item.products.name}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                      onClick={() => navigate(`/product/${item.products.id}`)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <h3 className="font-medium hover:underline cursor-pointer" 
                          onClick={() => navigate(`/product/${item.products.id}`)}>
                        {item.products.name}
                      </h3>
                      <p className="text-lg font-medium mt-1">
                        {formatCurrency(item.products.price)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleAddToCart(item.products)}
                        disabled={item.products.inventory <= 0}
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        {item.products.inventory <= 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleRemoveFromWishlist(item.product_id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
