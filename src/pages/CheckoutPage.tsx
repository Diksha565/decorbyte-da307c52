
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useApp } from '@/context/AppContext';
import { initiatePayment } from '@/lib/razorpay';
import { createOrder, createOrderItems, supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, user } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        setEmail(data.session.user.email || '');
      } else {
        toast({
          title: "Authentication required",
          description: "Please log in to proceed with checkout",
          variant: "destructive"
        });
        navigate('/login');
      }
    };
    
    checkUser();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Please add products before checking out.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to proceed with checkout",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create order in database first
      const shippingAddress = {
        name,
        email,
        phone,
        address,
        city,
        state,
        postalCode
      };
      
      const { data: orderData, error: orderError } = await createOrder({
        user_id: user.id,
        total: cartTotal,
        status: 'pending',
        shipping_address: shippingAddress
      });
      
      if (orderError) throw orderError;
      
      const orderId = orderData[0].id;
      
      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      const { error: itemsError } = await createOrderItems(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Call Razorpay
      const options = {
        amount: cartTotal * 100, // Convert to smallest currency unit (paise)
        currency: 'INR',
        name: 'DecorByte',
        description: `Order #${orderId}`,
        prefillData: {
          name,
          email,
          contact: phone
        },
        notes: {
          order_id: orderId
        }
      };
      
      const response = await initiatePayment(options);
      
      // Update order with payment info
      await supabase
        .from('orders')
        .update({ payment_id: response.razorpay_payment_id, status: 'completed' })
        .eq('id', orderId);
      
      // Clear cart and redirect to confirmation page
      clearCart();
      navigate(`/order-confirmation/${orderId}`);
      
      toast({
        title: "Order Successful!",
        description: "Your order has been placed successfully",
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <Card>
            <CardContent className="p-6">
              <p>Please log in to proceed with checkout</p>
              <Button onClick={() => navigate('/login')} className="mt-4">Go to Login</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <h2 className="text-xl font-semibold">Shipping Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || cart.length === 0}
              >
                {isLoading ? "Processing..." : `Pay ₹${cartTotal.toFixed(2)}`}
              </Button>
            </form>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>₹{cartTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
