
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp, Product } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { addToWishlist, removeFromWishlist, getUserWishlist } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, user } = useApp();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const isOutOfStock = product.inventory <= 0;

  useEffect(() => {
    // Check if product is in wishlist when user or product changes
    const checkWishlist = async () => {
      if (!user) {
        setIsWishlisted(false);
        return;
      }
      
      try {
        const { data } = await getUserWishlist(user.id);
        if (data) {
          const isInWishlist = data.some(item => item.product_id === product.id);
          setIsWishlisted(isInWishlist);
        }
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    };
    
    checkWishlist();
  }, [user, product.id]);

  const handleWishlistToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isWishlisted) {
        await removeFromWishlist(user.id, product.id);
        setIsWishlisted(false);
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`
        });
      } else {
        await addToWishlist(user.id, product.id);
        setIsWishlisted(true);
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`
        });
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast({
        title: "Action failed",
        description: "There was an error updating your wishlist.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Improved fallback images for all categories
  const getFallbackImage = () => {
    const fallbacks = {
      furniture: '/lovable-uploads/ac4decf7-36a9-4f60-9b53-3b5aaec7ddd5.png',
      lighting: '/lovable-uploads/91c22940-26e7-4352-a866-a85a9c700593.png',
      showpieces: '/lovable-uploads/2c9e87ae-3272-4df6-aa72-ef972aa66036.png',
      decor: '/lovable-uploads/c2bdfd29-4c1d-4f43-bd12-1cf7ee0e6e7d.png',
      wallpapers: '/lovable-uploads/bd4a3af5-d02e-4af3-851f-4af7110e3bf1.png'
    };
    
    // Return category-specific fallback or default fallback
    return fallbacks[product.category.toLowerCase()] || '/lovable-uploads/9e4b232b-6972-44b4-958a-2bea5a83db4e.png';
  };

  return (
    <div className="product-card group animate-fade-in border rounded-md overflow-hidden bg-white hover:shadow-md transition-shadow">
      {/* Product image */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-secondary/20">
          {!imageError ? (
            <img 
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform hover:scale-105"
              onError={handleImageError}
            />
          ) : (
            <img 
              src={getFallbackImage()}
              alt={product.name}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          )}
        </div>
      </Link>

      {/* Product details */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-foreground">
                <Link to={`/product/${product.id}`} className="hover:underline">
                  {product.name}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(product.price)}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleWishlistToggle}
              disabled={isLoading}
            >
              <Heart 
                size={18} 
                className={isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-accent"} 
              />
            </Button>
          </div>
        </div>

        {/* Stock indicator */}
        {isOutOfStock ? (
          <div className="mt-4">
            <span className="bg-destructive/10 text-destructive text-xs font-medium px-2.5 py-0.5 rounded">
              Out of Stock
            </span>
          </div>
        ) : (
          <Button 
            onClick={() => addToCart(product, 1)} 
            className="mt-4 w-full justify-center"
            variant="outline"
            disabled={isOutOfStock}
          >
            <ShoppingCart size={16} className="mr-2" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
