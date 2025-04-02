
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductsByCategory } from '@/lib/supabase';
import ProductGrid from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Product } from '@/context/AppContext';

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', categoryId, inStockOnly],
    queryFn: () => getProductsByCategory(categoryId || '', inStockOnly),
    enabled: !!categoryId,
  });

  const handlePriceChange = (values: number[]) => {
    const [min, max] = values;
    setMinPrice(min);
    setMaxPrice(max);
  };

  useEffect(() => {
    if (products?.data) {
      let filtered = [...products.data];
      
      // Apply price filter
      filtered = filtered.filter(
        (product) => product.price >= minPrice && product.price <= maxPrice
      );
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default:
            return 0;
        }
      });
      
      setFilteredProducts(filtered);
    }
  }, [products?.data, minPrice, maxPrice, sortBy]);

  // Format the category name for display
  const formatCategoryName = (category: string) => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const formattedCategoryName = formatCategoryName(categoryId || '');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-secondary/50 to-background py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-6xl font-display font-light">
              {formattedCategoryName}
            </h1>
          </div>
        </div>
        
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Filters sidebar */}
            <div className="md:col-span-1 space-y-8">
              <div>
                <h2 className="text-lg font-medium mb-4">Search</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">Price Range</h2>
                <div className="space-y-4">
                  <Slider
                    defaultValue={[minPrice, maxPrice]}
                    min={0}
                    max={10000}
                    step={100}
                    onValueChange={handlePriceChange}
                    className="my-6"
                  />
                  <div className="flex justify-between">
                    <span>₹{minPrice}</span>
                    <span>₹{maxPrice}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">Availability</h2>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="in-stock" 
                    checked={inStockOnly}
                    onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                  />
                  <Label htmlFor="in-stock">In stock only</Label>
                </div>
              </div>
            </div>
            
            {/* Products grid */}
            <div className="md:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  Showing {filteredProducts.length} products
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm hidden md:inline">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-secondary h-64 rounded-md mb-2"></div>
                      <div className="bg-secondary h-4 rounded mb-2"></div>
                      <div className="bg-secondary h-4 w-1/2 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive mb-2">Sorry, something went wrong.</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try again
                  </Button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">No products found.</p>
                  {inStockOnly && (
                    <Button variant="outline" onClick={() => setInStockOnly(false)}>
                      Show all products
                    </Button>
                  )}
                </div>
              ) : (
                <ProductGrid products={filteredProducts} />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
