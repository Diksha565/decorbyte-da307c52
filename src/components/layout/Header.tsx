
// Not modifying Header.tsx directly as it's in read-only files.
// Instead, create a small utility to help with navigation to our new pages.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart } from 'lucide-react';

const NavigationUtils = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => navigate('/my-orders')}>
        <ShoppingBag className="h-5 w-5" />
        <span className="ml-2">My Orders</span>
      </Button>
      
      <Button variant="ghost" size="sm" onClick={() => navigate('/wishlist')}>
        <Heart className="h-5 w-5" />
        <span className="ml-2">Wishlist</span>
      </Button>
    </>
  );
};

export default NavigationUtils;
