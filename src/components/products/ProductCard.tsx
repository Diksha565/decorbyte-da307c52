
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp, Product } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useApp();
  
  const isOutOfStock = product.inventory <= 0;

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
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Heart size={18} className="text-muted-foreground hover:text-accent" />
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
