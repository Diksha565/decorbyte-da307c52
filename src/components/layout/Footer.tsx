
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-decor-charcoal text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-display mb-4">decorbyte</h2>
            <p className="text-sm text-gray-300 mb-4">
              Elevate your space with curated interior design pieces that blend style and functionality.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-lg font-medium mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link to="/category/furniture" className="text-gray-300 hover:text-white transition-colors">Furniture</Link></li>
              <li><Link to="/category/lighting" className="text-gray-300 hover:text-white transition-colors">Lighting</Link></li>
              <li><Link to="/category/showpieces" className="text-gray-300 hover:text-white transition-colors">Showpieces</Link></li>
              <li><Link to="/category/decor" className="text-gray-300 hover:text-white transition-colors">Decorative Items</Link></li>
              <li><Link to="/category/wallpapers" className="text-gray-300 hover:text-white transition-colors">Wallpapers</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-medium mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="text-gray-300 hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-gray-300 hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-medium mb-4">Join Our Newsletter</h3>
            <p className="text-sm text-gray-300 mb-4">
              Subscribe to get special offers, design tips, and new product announcements.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 w-full text-gray-800 border-none rounded-l focus:outline-none"
              />
              <button
                type="submit"
                className="bg-decor-teal text-white px-4 py-2 rounded-r hover:bg-decor-teal/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6">
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} decorbyte. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
