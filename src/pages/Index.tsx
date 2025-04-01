
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import ProductGrid from '@/components/products/ProductGrid';
import { supabase } from '@/lib/supabase';
import { Product } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const categories = [
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Timeless pieces that define your space',
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600&q=80',
  },
  {
    id: 'lighting',
    name: 'Lighting',
    description: 'Illuminate your home with style',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600&q=80',
  },
  {
    id: 'showpieces',
    name: 'Showpieces',
    description: 'Statement pieces that spark conversation',
    image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600&q=80',
  },
  {
    id: 'decor',
    name: 'Decorative Items',
    description: 'Refine your space with thoughtful details',
    image: 'https://images.unsplash.com/photo-1499955085172-a104c9463ece?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600&q=80',
  },
  {
    id: 'wallpapers',
    name: 'Wallpapers',
    description: 'Transform your walls with stunning patterns',
    image: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600&q=80',
  },
];

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080&q=80',
    title: 'Elevate Your Interior Design',
    description: 'Discover unique decor pieces that reflect your personal style and transform your living space.',
    buttonText: 'Shop Now',
    buttonLink: '/category/furniture',
    altText: 'Modern living room interior design',
  },
  {
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080&q=80',
    title: 'Autumn Collection 2023',
    description: 'Warm tones and cozy textures for the season of transition.',
    buttonText: 'Explore Collection',
    buttonLink: '/category/decor',
    altText: 'Autumn themed interior design',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080&q=80',
    title: 'Timeless Elegance',
    description: 'Sophisticated furniture pieces that stand the test of time.',
    buttonText: 'View Furniture',
    buttonLink: '/category/furniture',
    altText: 'Elegant furniture in modern home',
  },
];

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // In a real application, you would have a featured flag or query
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .limit(8);
          
        if (error) throw error;
        setFeaturedProducts(data || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
    
    // Auto-advance hero slides
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              aria-hidden={index !== currentSlide}
            >
              <div className="container-custom h-full flex flex-col justify-center items-start text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 max-w-2xl animate-slide-in-bottom">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl max-w-xl mb-8 animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>
                  {slide.description}
                </p>
                <Button
                  asChild
                  className="bg-white text-primary hover:bg-white/90 animate-slide-in-bottom"
                  style={{ animationDelay: '0.2s' }}
                >
                  <Link to={slide.buttonLink}>{slide.buttonText}</Link>
                </Button>
              </div>
            </div>
          ))}
          
          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-secondary/50">
          <div className="container-custom">
            <h2 className="text-3xl font-display font-medium mb-2">Shop by Category</h2>
            <p className="text-muted-foreground mb-8">Explore our curated collection of interior design products</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="group overflow-hidden rounded-lg relative h-64 transition-transform hover:-translate-y-1"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${category.image})` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 flex flex-col justify-end p-6">
                    <h3 className="text-xl font-medium text-white mb-1">{category.name}</h3>
                    <p className="text-sm text-white/80 mb-3">{category.description}</p>
                    <div className="flex items-center text-white text-sm font-medium transition-colors">
                      <span>Explore</span>
                      <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="flex justify-between items-baseline mb-8">
              <div>
                <h2 className="text-3xl font-display font-medium mb-2">Featured Products</h2>
                <p className="text-muted-foreground">Handpicked items to elevate your space</p>
              </div>
              <Link to="/products" className="text-accent hover:text-accent/80 flex items-center">
                View all
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <ProductGrid products={featuredProducts} loading={loading} />
          </div>
        </section>

        {/* Inspiration Section */}
        <section className="py-16 bg-decor-cream">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-display font-medium mb-4">Design Inspiration</h2>
                <p className="text-lg mb-6">
                  Transform your space with curated design ideas from our experts.
                  Discover how to mix and match our products to create a cohesive look
                  that reflects your personal style.
                </p>
                <Button asChild>
                  <Link to="/inspiration">Get Inspired</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=400&q=80"
                    alt="Living room inspiration"
                    className="rounded-lg object-cover w-full h-48"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300&q=80"
                    alt="Kitchen inspiration"
                    className="rounded-lg object-cover w-full h-32"
                  />
                </div>
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1617325710236-4a36ca7f6ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300&q=80"
                    alt="Bedroom inspiration"
                    className="rounded-lg object-cover w-full h-32"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1616593658833-4e3db17a8c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=400&q=80"
                    alt="Office inspiration"
                    className="rounded-lg object-cover w-full h-48"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-decor-teal text-white">
          <div className="container-custom text-center max-w-3xl">
            <h2 className="text-3xl font-display font-medium mb-4">Join Our Newsletter</h2>
            <p className="text-lg mb-6 text-white/80">
              Stay updated with our latest products, exclusive offers, and interior design tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-md text-foreground focus:outline-none"
                required
              />
              <Button type="submit" className="bg-white text-decor-teal hover:bg-white/90">
                Subscribe
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
