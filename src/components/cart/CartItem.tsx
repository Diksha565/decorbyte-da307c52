
import React from 'react';
import { useApp, CartItem as CartItemType } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateCartItemQuantity, removeFromCart } = useApp();
  const { product, quantity } = item;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateCartItemQuantity(product.id, newQuantity);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      updateCartItemQuantity(product.id, quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.inventory) {
      updateCartItemQuantity(product.id, quantity + 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b">
      {/* Product Image */}
      <div className="sm:w-24 sm:h-24 mb-4 sm:mb-0 mr-4 overflow-hidden rounded-md">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {formatCurrency(product.price)}
        </p>
        {product.inventory < 10 && (
          <p className="text-xs text-decor-terracotta mt-1">
            Only {product.inventory} left in stock
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center mt-4 sm:mt-0">
        <div className="flex items-center mr-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            <Minus size={14} />
          </Button>
          <Input
            type="number"
            min="1"
            max={product.inventory}
            value={quantity}
            onChange={handleQuantityChange}
            className="h-8 w-12 text-center rounded-none border-x-0"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={incrementQuantity}
            disabled={quantity >= product.inventory}
          >
            <Plus size={14} />
          </Button>
        </div>

        {/* Item Total and Remove */}
        <div className="flex flex-col items-end">
          <span className="font-medium">
            {formatCurrency(product.price * quantity)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mt-2 text-muted-foreground"
            onClick={() => removeFromCart(product.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
