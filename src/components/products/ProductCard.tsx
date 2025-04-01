
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

  return (
    <div className="product-card group animate-fade-in">
      {/* Product image */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="product-image-container">
          <img 
            src={product.image_url}
            alt={product.name}
            className="product-image"
          />
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
