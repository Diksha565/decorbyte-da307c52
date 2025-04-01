
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Package, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  products?: {
    name: string;
    image_url: string;
  }
};

type Order = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  payment_id: string | null;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  } | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
};

const MyOrdersPage = () => {
  const { user, isLoading: userLoading } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await getUserOrders(user.id);
        
        if (error) throw error;
        
        if (data) {
          setOrders(data as Order[]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!userLoading) {
      fetchOrders();
    }
  }, [user, userLoading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/login', { state: { from: '/my-orders' } });
    }
  }, [user, userLoading, navigate]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-lg">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">You haven't placed any orders yet</h2>
              <p className="text-muted-foreground mb-6">Browse our products and place your first order.</p>
              <Button onClick={() => navigate('/')}>
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-secondary/20">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Order placed on {formatDate(order.created_at)}
                        </p>
                        <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="mb-2">{getStatusBadge(order.status)}</div>
                        <p className="font-medium">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-3">Order Items</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-right">Quantity</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.order_items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.products?.name || 'Product'}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {order.shipping_address && (
                        <div>
                          <Separator className="my-4" />
                          <h3 className="font-medium mb-3">Shipping Information</h3>
                          <div className="text-sm">
                            <p className="font-medium">{order.shipping_address.name}</p>
                            <p>{order.shipping_address.address}</p>
                            <p>
                              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/order-confirmation/${order.id}`)}
                          className="flex items-center"
                        >
                          Order Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
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

export default MyOrdersPage;
