'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductImage from '../components/ProductImage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data.slice(0, 6)); // Show first 6 products
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isPublic={true} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-blue via-blue-600 to-brand-green text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Solidex Manufacturing Company
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-blue-50">
            SOLIDEX MANUFACTURING COMPANY (SEMCO) is based in Bangalore and is involved in the 
            manufacturing of heavy-duty high-quality excavator buckets ranging from <strong>0.75 - 80 Ton</strong> machines.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/products-public" 
              className="bg-white text-brand-blue px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
            >
              View Products
            </Link>
            <Link 
              href="/contact" 
              className="bg-brand-yellow text-white px-8 py-4 rounded-xl font-semibold hover:bg-yellow-600 hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About Our Organization</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We manufacture wide range buckets suiting all types of excavators. 
              While maintaining the profile of a standard bucket, its structure will be reinforced 
              at the points subjected to greater stress and wear.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-5xl font-bold text-brand-blue mb-3">12+</div>
              <div className="text-gray-700 font-medium text-lg">Products Available</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-5xl font-bold text-brand-green mb-3">0.75-80</div>
              <div className="text-gray-700 font-medium text-lg">Ton Machines</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-5xl font-bold text-brand-yellow mb-3">100%</div>
              <div className="text-gray-700 font-medium text-lg">Quality Assured</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Products</h2>
            <p className="text-lg md:text-xl text-gray-600">
              High-quality excavator buckets and related equipment
            </p>
          </div>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {products.map((product, index) => (
                <div 
                  key={product._id} 
                  className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="h-56 relative overflow-hidden">
                    <ProductImage
                      src={product.image}
                      images={product.images}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <span className="inline-block px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-full mb-3">
                      {product.category}
                    </span>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description || 'Quality manufacturing with precision engineering'}
                    </p>
                    <Link 
                      href={`/products-public#${product._id}`}
                      className="inline-flex items-center text-brand-blue hover:text-blue-600 font-semibold group"
                    >
                      View Details
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center">
            <Link 
              href="/products-public"
              className="inline-block bg-brand-blue text-white px-10 py-4 rounded-xl font-semibold hover:bg-blue-600 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
            <p className="text-lg md:text-xl text-gray-300">
              Have any questions? We'd love to hear from you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-8 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">📞</div>
              <h3 className="font-semibold text-lg mb-3">Phone</h3>
              <a href="tel:+919845724747" className="text-gray-300 hover:text-white transition-colors">
                +91 9845724747
              </a>
            </div>
            <div className="text-center p-8 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="font-semibold text-lg mb-3">Email</h3>
              <a href="mailto:jagadish@solidex.in" className="text-gray-300 hover:text-white transition-colors">
                jagadish@solidex.in
              </a>
            </div>
            <div className="text-center p-8 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="font-semibold text-lg mb-3">Location</h3>
              <p className="text-gray-300">Bangalore, India</p>
            </div>
          </div>
          <div className="text-center">
            <Link 
              href="/contact"
              className="inline-block bg-brand-blue text-white px-10 py-4 rounded-xl font-semibold hover:bg-blue-600 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">SOLIDEX</h3>
              <p className="text-sm text-gray-400">
                Manufacturing high-quality excavator buckets and heavy-duty equipment.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/products-public" className="hover:text-white transition-colors">Products</Link></li>
                <li><Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>+91 9845724747</li>
                <li>jagadish@solidex.in</li>
                <li>Bangalore, India</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <p className="text-sm text-gray-400">
                Stay connected with us for latest updates and product information.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Solidex Manufacturing Company. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
