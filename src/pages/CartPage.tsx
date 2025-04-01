
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import CartItem from '@/components/cart/CartItem';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const CartPage = () => {
  const { cart, cartTotal, clearCart, user } = useApp();
  const navigate = useNavigate();
  
  // Constants for calculations
  const shipping = cartTotal > 0 ? 5.99 : 0;
  const tax = cartTotal * 0.07; // 7% tax rate
  const orderTotal = cartTotal + shipping + tax;
  
  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="container-custom">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="mr-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Continue Shopping
            </Button>
            <h1 className="text-2xl font-display">Your Cart</h1>
          </div>

          {cart.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg border shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-medium">Cart Items ({cart.length})</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                  </div>
                  
                  <div className="divide-y">
                    {cart.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border shadow-sm p-6 sticky top-24">
                  <h2 className="font-medium mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatCurrency(shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (7%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="border-t pt-3 mt-3 flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(orderTotal)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Taxes and shipping calculated at checkout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border shadow-sm p-12 text-center">
              <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center bg-secondary rounded-full">
                <ShoppingBag size={24} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button asChild>
                <Link to="/">Start Shopping</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
