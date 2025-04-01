
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { createOrder, createOrderItems } from '@/lib/supabase';
import { initiatePayment } from '@/lib/razorpay';
import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  address: z.string().min(5, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  zip: z.string().min(5, { message: 'ZIP code is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
});

const CheckoutPage = () => {
  const { user, cart, cartTotal, clearCart } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
  });

  // Constants for calculations
  const shipping = cartTotal > 0 ? 5.99 : 0;
  const tax = cartTotal * 0.07; // 7% tax rate
  const orderTotal = cartTotal + shipping + tax;
  
  // Redirect to login if user is not authenticated
  React.useEffect(() => {
    if (!user && !isProcessing) {
      toast({
        title: "Authentication required",
        description: "Please login to proceed with checkout",
        variant: "destructive",
      });
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [user, navigate, isProcessing, toast]);

  // Redirect to cart if cart is empty
  React.useEffect(() => {
    if (cart.length === 0 && !isProcessing) {
      navigate('/cart');
    }
  }, [cart, navigate, isProcessing]);

  const handleSubmitForm = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to proceed with checkout",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      setIsProcessing(true);

      // Create shipping address object
      const shippingAddress = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        state: values.state,
        zip: values.zip,
        country: values.country
      };

      // Create order in Supabase
      const { data: orderData, error: orderError } = await createOrder({
        user_id: user.id,
        total: orderTotal,
        shipping_address: shippingAddress,
        status: 'pending',
      });

      if (orderError || !orderData) {
        throw new Error(orderError?.message || 'Failed to create order');
      }

      const orderId = orderData[0].id;

      // Format order items
      const orderItems = cart.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      // Create order items in Supabase
      const { error: itemsError } = await createOrderItems(orderItems);

      if (itemsError) {
        throw new Error(itemsError.message || 'Failed to create order items');
      }

      // Initialize Razorpay payment
      const paymentResponse = await initiatePayment({
        amount: orderTotal,
        name: "DecorByte Store",
        description: `Order #${orderId.slice(0, 8)}`,
        prefillData: {
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          contact: values.phone
        }
      });

      if (paymentResponse) {
        // Update order status to 'paid'
        // In a real application, you would verify the payment with your backend
        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'paid', 
            payment_id: paymentResponse.razorpay_payment_id 
          })
          .eq('id', orderId);

        if (updateError) {
          throw new Error(updateError.message || 'Failed to update order status');
        }

        // Clear cart and redirect to confirmation page
        clearCart();
        
        toast({
          title: "Payment successful",
          description: "Your order has been placed successfully",
        });

        // Navigate to confirmation page (we'll create this next)
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message || "Something went wrong during checkout.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (!user || cart.length === 0) {
    return null; // Will redirect via useEffect
  }

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
              onClick={() => navigate('/cart')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Cart
            </Button>
            <h1 className="text-2xl font-display">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
                  <div className="bg-card rounded-lg border shadow-sm p-6">
                    <h2 className="font-medium mb-4">Shipping Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zip"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP/Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="United States" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Summary - Mobile */}
                  <div className="lg:hidden bg-card rounded-lg border shadow-sm p-6">
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
                    <div className="mt-6">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <CreditCard size={16} className="mr-2" />
                            Pay {formatCurrency(orderTotal)}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Desktop Checkout Button */}
                  <div className="hidden lg:block">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <CreditCard size={16} className="mr-2" />
                          Pay {formatCurrency(orderTotal)}
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* Order Summary - Desktop */}
            <div className="hidden lg:block">
              <div className="bg-card rounded-lg border shadow-sm p-6 sticky top-24">
                <h2 className="font-medium mb-4">Order Summary</h2>
                
                {/* Cart Items Summary */}
                <div className="space-y-4 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="w-12 h-12 rounded overflow-hidden mr-3">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                {/* Totals */}
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
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  By completing your purchase, you agree to our Terms of Service and Privacy Policy.
                </p>
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
