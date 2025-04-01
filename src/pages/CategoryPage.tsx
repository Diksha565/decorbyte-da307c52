
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductsByCategory } from '@/lib/supabase';
import { Product } from '@/context/AppContext';
import ProductGrid from '@/components/products/ProductGrid';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Map category IDs to display names
const categoryNames: Record<string, string> = {
  furniture: 'Furniture',
  lighting: 'Lighting',
  showpieces: 'Showpieces',
  decor: 'Decorative Items',
  wallpapers: 'Wallpapers',
};

// Category header images
const categoryImages: Record<string, string> = {
  furniture: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=400&q=80',
  lighting: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=400&q=80',
  showpieces: 'https://images.unsplash.com/photo-1525962898597-a4ae6402826e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=400&q=80',
  decor: 'https://images.unsplash.com/photo-1584271854089-9bb3e5168e32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=400&q=80',
  wallpapers: 'https://images.unsplash.com/photo-1590725175785-de025cc3f1ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=400&q=80',
};

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inStock, setInStock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Get the category name based on the ID in the URL
  const categoryName = categoryId ? categoryNames[categoryId] || 'Products' : 'Products';
  const categoryImage = categoryId ? categoryImages[categoryId] : '';

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await getProductsByCategory(categoryId);
        
        if (error) throw error;
        
        setProducts(data || []);
        setFilteredProducts(data || []);
        
        // Set initial price range based on products
        if (data && data.length > 0) {
          const prices = data.map(p => p.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let result = [...products];
    
    // Apply price filter
    result = result.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }
    
    // Apply in-stock filter
    if (inStock) {
      result = result.filter((product) => product.inventory > 0);
    }
    
    setFilteredProducts(result);
  }, [products, priceRange, searchQuery, inStock]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Category Header */}
        <div 
          className="h-48 md:h-64 bg-cover bg-center relative"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${categoryImage})` 
          }}
        >
          <div className="container-custom h-full flex items-end justify-start pb-8">
            <h1 className="text-3xl md:text-4xl font-display text-white">{categoryName}</h1>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} products
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} className="mr-2" />
                Filters
              </Button>
            </div>
            
            {/* Filters - Desktop (always visible) and Mobile (toggleable) */}
            <div 
              className={`lg:w-1/4 space-y-6 ${
                showFilters ? 'block' : 'hidden lg:block'
              }`}
            >
              {/* Mobile Filter Header */}
              <div className="lg:hidden flex justify-between items-center">
                <h2 className="text-lg font-medium">Filters</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowFilters(false)}
                >
                  <X size={18} />
                </Button>
              </div>
              
              {/* Search */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Search</h3>
                <div className="relative">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Price Range</h3>
                  <span className="text-sm text-muted-foreground">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1000}
                  step={5}
                  value={[priceRange[0], priceRange[1]]}
                  onValueChange={(value) => setPriceRange([value[0], value[1]])}
                  className="py-4"
                />
              </div>
              
              {/* Availability */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Availability</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-stock"
                    checked={inStock}
                    onCheckedChange={(checked) => 
                      setInStock(checked as boolean)
                    }
                  />
                  <Label htmlFor="in-stock">In stock only</Label>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="lg:w-3/4">
              <div className="hidden lg:flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} products
                </p>
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal size={16} />
                  <span className="text-sm">Sort by:</span>
                  <select className="text-sm border border-input bg-background rounded-md px-2 py-1">
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
              
              <ProductGrid products={filteredProducts} loading={loading} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
