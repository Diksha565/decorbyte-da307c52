
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Heart, Search, Menu, X } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const Header = () => {
  const { user, totalItems } = useApp();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out.",
        variant: "destructive"
      });
    }
  };

  const categories = [
    { name: 'Furniture', path: '/category/furniture' },
    { name: 'Lighting', path: '/category/lighting' },
    { name: 'Showpieces', path: '/category/showpieces' },
    { name: 'Decorative Items', path: '/category/decor' },
    { name: 'Wallpapers', path: '/category/wallpapers' },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="container-custom mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-display tracking-wide text-decor-charcoal">
              decorbyte
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {categories.map((category) => (
              <Link
                key={category.path}
                to={category.path}
                className="text-sm font-medium hover:text-accent transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Link to="/search" className="p-2 hover:bg-secondary rounded-full">
              <Search size={20} />
            </Link>
            
            {user ? (
              <>
                <Link to="/wishlist" className="p-2 hover:bg-secondary rounded-full">
                  <Heart size={20} />
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <User size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="w-full">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="w-full">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">Sign in</Button>
              </Link>
            )}
            
            <Link to="/cart" className="p-2 hover:bg-secondary rounded-full relative">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-decor-teal text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border py-4">
          <div className="container-custom flex flex-col space-y-4">
            {categories.map((category) => (
              <Link
                key={category.path}
                to={category.path}
                className="text-sm font-medium py-2 hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
