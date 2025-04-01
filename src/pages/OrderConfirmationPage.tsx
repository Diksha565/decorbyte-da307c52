
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Check, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
          
        if (orderError) throw orderError;
        
        setOrder(orderData);
        
        // Fetch order items with product details
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*, products(*)')
          .eq('order_id', orderId);
          
        if (itemsError) throw itemsError;
        
        setOrderItems(itemsData || []);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container-custom py-16">
          <div className="text-center">
            <div className="animate-pulse h-8 w-48 bg-secondary mx-auto rounded mb-4"></div>
            <div className="animate-pulse h-4 w-64 bg-secondary mx-auto rounded mb-8"></div>
            <div className="animate-pulse h-32 w-full max-w-md mx-auto rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container-custom py-16">
          <div className="text-center">
            <h1 className="text-2xl font-display mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-8">
              We couldn't find the order you're looking for.
            </p>
            <Button asChild>
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format order date
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate order subtotal
  const subtotal = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Constants for calculations
  const shipping = 5.99;
  const tax = subtotal * 0.07; // 7% tax
  const total = order.total;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="bg-card rounded-lg border shadow-sm p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <h1 className="text-2xl font-display mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. We've received your order and will process it shortly.
              </p>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Order Information</h3>
                <div className="text-sm">
                  <p><span className="font-medium">Order Number:</span> {orderId?.slice(0, 8)}</p>
                  <p><span className="font-medium">Order Date:</span> {orderDate}</p>
                  <p><span className="font-medium">Payment Status:</span> 
                    <span className="text-green-600 ml-1">
                      {order.status === 'paid' ? 'Paid' : 'Processing'}
                    </span>
                  </p>
                  {order.payment_id && (
                    <p><span className="font-medium">Payment ID:</span> {order.payment_id}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
                <div className="text-sm">
                  {order.shipping_address && (
                    <>
                      <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                      <p>{order.shipping_address.address}</p>
                      <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                      <p>{order.shipping_address.country}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <h3 className="text-sm font-medium mb-3">Order Summary</h3>
            <div className="border rounded-md mb-6">
              <div className="divide-y">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex py-4 px-4">
                    <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.products.name}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals */}
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/">
                  <ShoppingBag size={16} className="mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
