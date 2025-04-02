import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Heart, User, ShoppingCart, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase'; // Import supabase client
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { signOut } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/context/AppContext';
import { useDebounce } from '@/hooks/use-debounce';

const categories = [
  { name: 'Furniture', path: '/category/furniture' },
  { name: 'Lighting', path: '/category/lighting' },
  { name: 'Showpieces', path: '/category/showpieces' },
  { name: 'Decorative Items', path: '/category/decor' },
  { name: 'Wallpapers', path: '/category/wallpapers' },
];

const Header = () => {
  const navigate = useNavigate();
  const { user, cart } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${debouncedSearchQuery}%,description.ilike.%${debouncedSearchQuery}%`)
          .eq('active', true)
          .limit(10);
          
        if (error) throw error;
        setSearchResults(data || []);
        setIsSearchOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSearchSelect = (productId: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/');
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-2xl tracking-tight">
            decorbyte
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="text-sm font-medium hover:text-accent transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <NavigationMenu className="md:hidden">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[200px]">
                    {categories.map((category) => (
                      <li key={category.name}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={category.path}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            )}
                          >
                            <div className="text-sm font-medium">{category.name}</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-4">
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <form onSubmit={handleSearchSubmit} className="flex items-center border-b p-2">
                  <Search className="h-4 w-4 mr-2 flex-shrink-0 opacity-50" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </form>
                {searchResults.length > 0 && (
                  <div className="max-h-[300px] overflow-auto p-2">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => handleSearchSelect(product.id)}
                      >
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded mr-3"
                            onError={(e) => {
                              const fallbacks = {
                                furniture: '/lovable-uploads/ac4decf7-36a9-4f60-9b53-3b5aaec7ddd5.png',
                                lighting: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&h=600&q=80',
                                showpieces: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&h=600&q=80',
                                decor: 'https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&h=600&q=80',
                                wallpapers: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=800&h=600&q=80'
                              };
                              (e.target as HTMLImageElement).src = fallbacks[product.category] || '/lovable-uploads/9e4b232b-6972-44b4-958a-2bea5a83db4e.png';
                            }}
                          />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchQuery.length > 1 && searchResults.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found.
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/wishlist')}
              className="text-foreground"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground relative"
                  aria-label={user ? "Account" : "Sign in"}
                >
                  {user ? (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                      <Heart className="mr-2 h-4 w-4" />
                      My Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-orders')}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/login')}>
                      Sign in
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/register')}>
                      Create account
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/cart')}
              className="text-foreground relative"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
