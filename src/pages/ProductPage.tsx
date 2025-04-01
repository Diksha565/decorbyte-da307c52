import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProduct } from '@/lib/supabase';
import { useApp, Product } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Heart, ShoppingCart, Truck, Shield, Package, AlertTriangle, Plus, Minus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { addToWishlist, removeFromWishlist, getUserWishlist } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useApp();
  const navigate = useNavigate();
  const { user } = useApp();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const additionalImages = [
    'https://images.unsplash.com/photo-1593640495253-23196b27a87f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800&q=80',
    'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800&q=80',
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await getProduct(productId);
        
        if (error) throw error;
        
        setProduct(data || null);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !product) return;
      
      try {
        const { data } = await getUserWishlist(user.id);
        if (data) {
          const isInWishlist = data.some(item => item.product_id === product.id);
          setIsWishlisted(isInWishlist);
        }
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    };
    
    checkWishlist();
  }, [user, product]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.inventory) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && product && value <= product.inventory) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container-custom py-8">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-secondary h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-secondary rounded w-3/4"></div>
              <div className="h-6 bg-secondary rounded w-1/4"></div>
              <div className="h-4 bg-secondary rounded w-full"></div>
              <div className="h-4 bg-secondary rounded w-full"></div>
              <div className="h-4 bg-secondary rounded w-3/4"></div>
              <div className="h-10 bg-secondary rounded w-full mt-8"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container-custom py-16 text-center">
          <h1 className="text-2xl font-display mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const allImages = [product.image_url, ...additionalImages];
  const isOutOfStock = product.inventory <= 0;

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
              Back
            </Button>
            <nav className="text-sm text-muted-foreground">
              <Link to="/" className="hover:text-accent">Home</Link>
              <span className="mx-2">/</span>
              <Link to={`/category/${product.category}`} className="hover:text-accent">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-secondary rounded-lg overflow-hidden aspect-square">
                <img
                  src={allImages[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-square bg-secondary rounded overflow-hidden ${
                      activeImage === index ? 'ring-2 ring-accent' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-display mb-2">{product.name}</h1>
              <p className="text-2xl font-medium mb-4">
                {formatCurrency(product.price)}
              </p>
              
              {isOutOfStock ? (
                <div className="bg-destructive/10 text-destructive text-sm px-3 py-1 rounded-full inline-flex items-center mb-4">
                  <AlertTriangle size={14} className="mr-1" />
                  Out of Stock
                </div>
              ) : product.inventory < 10 ? (
                <div className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full inline-flex items-center mb-4">
                  <AlertTriangle size={14} className="mr-1" />
                  Low Stock - Only {product.inventory} left
                </div>
              ) : (
                <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full inline-flex items-center mb-4">
                  <Package size={14} className="mr-1" />
                  In Stock
                </div>
              )}
              
              <div className="prose prose-sm mb-6">
                <p>{product.description}</p>
              </div>
              
              {!isOutOfStock && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="mr-4">Quantity:</span>
                    <div className="flex items-center">
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
                        className="h-8 w-16 rounded-none text-center border-x-0"
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
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleWishlistToggle}
                      disabled={wishlistLoading}
                    >
                      <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="border-t border-border mt-8 pt-6 space-y-4">
                <div className="flex">
                  <div className="mr-3">
                    <Truck size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Free Shipping</h3>
                    <p className="text-sm text-muted-foreground">
                      On orders over $50. Delivery in 3-5 business days.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-3">
                    <Package size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Easy Returns</h3>
                    <p className="text-sm text-muted-foreground">
                      30-day return policy. Return shipping is free.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-3">
                    <Shield size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Secure Checkout</h3>
                    <p className="text-sm text-muted-foreground">
                      Your payment information is processed securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-display mb-6">Product Details</h2>
            
            <div className="prose max-w-none">
              <p>
                This {product.name} is crafted with attention to detail and premium materials,
                designed to enhance your interior space with elegance and functionality.
                Each piece is carefully inspected to ensure it meets our high standards of quality.
              </p>
              
              <h3>Features:</h3>
              <ul>
                <li>Premium quality materials</li>
                <li>Expertly crafted with attention to detail</li>
                <li>Designed to complement various interior styles</li>
                <li>Durable construction for long-lasting use</li>
              </ul>
              
              <h3>Specifications:</h3>
              <ul>
                <li>Material: Premium quality materials</li>
                <li>Dimensions: Please refer to product images for exact measurements</li>
                <li>Color: As shown in product images</li>
                <li>Care Instructions: Wipe clean with a dry cloth</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;
