
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { getUserProfile, createOrUpdateUserProfile, getUserOrders } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ChevronRight } from 'lucide-react';

type OrderType = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: any[];
};

const ProfilePage = () => {
  const { user, isLoading } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await getUserProfile(user.id);
        
        if (error) throw error;
        
        if (data) {
          setProfile({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zip: data.zip || '',
            country: data.country || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive"
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchOrdersData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await getUserOrders(user.id);
        
        if (error) throw error;
        console.log('Orders data:', data);
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load order history.",
          variant: "destructive"
        });
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) {
      fetchProfileData();
      fetchOrdersData();
    } else if (!isLoading) {
      setLoadingProfile(false);
      setLoadingOrders(false);
    }
  }, [user, isLoading, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setSaving(true);
    
    try {
      const { error } = await createOrUpdateUserProfile({
        id: user.id,
        email: user.email,
        ...profile,
        updated_at: new Date()
      });
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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

  // If not logged in and not loading, redirect to login
  if (!user && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8 bg-secondary/20">
        <div className="container-custom">
          <h1 className="text-3xl font-display mb-6">My Account</h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details and shipping address.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingProfile ? (
                    <div className="animate-pulse space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-10 bg-secondary rounded"></div>
                        <div className="h-10 bg-secondary rounded"></div>
                      </div>
                      <div className="h-10 bg-secondary rounded"></div>
                      <div className="h-10 bg-secondary rounded"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-10 bg-secondary rounded"></div>
                        <div className="h-10 bg-secondary rounded"></div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            name="first_name"
                            value={profile.first_name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            name="last_name"
                            value={profile.last_name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={profile.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={profile.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={profile.city}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province</Label>
                          <Input
                            id="state"
                            name="state"
                            value={profile.state}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="zip">ZIP/Postal Code</Label>
                          <Input
                            id="zip"
                            name="zip"
                            value={profile.zip}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            name="country"
                            value={profile.country}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    View all your past orders and their status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-12 bg-secondary rounded"></div>
                      <div className="h-12 bg-secondary rounded"></div>
                      <div className="h-12 bg-secondary rounded"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:bg-secondary/10 transition-colors">
                          <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Order placed on {formatDate(order.created_at)}
                              </p>
                              <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="mb-1">{getStatusBadge(order.status)}</div>
                              <p className="font-medium">{formatCurrency(order.total)}</p>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mt-2 flex items-center"
                            onClick={() => navigate(`/order-confirmation/${order.id}`)}
                          >
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        You haven't placed any orders yet.
                      </p>
                      <Button asChild>
                        <a href="/">Start Shopping</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                  <CardDescription>
                    View and manage your wishlist items.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Your wishlist is empty.
                    </p>
                    <Button asChild>
                      <a href="/">Browse Products</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
