"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import ProductCard from '@/components/Product/ProductCard';
import ProductFilter from '@/components/Product/ProductFilter';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const categories = ['Candles', 'Cookies', 'Chocolates'];

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchProducts = async () => {
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockProducts = [
          {
            id: 1,
            name: 'Vanilla Dream Candle',
            description: 'Box Glass Jar',
            price: 24.99,
            category: 'candles',
            image: '/images/vanilla-candle.jpg',
            stock: true,
            isNew: true,
          },
          {
            id: 2,
            name: 'Classic Chocolate Chip Cookies',
            description: 'Box of 12',
            price: 18.50,
            category: 'cookies',
            image: '/images/chocolate-chip.jpg',
            stock: true,
            isNew: true,
            bestseller: true,
          },
          {
            id: 3,
            name: 'Lavender Fields Candle',
            description: '10oz Ceramic Jar',
            price: 29.99,
            category: 'candles',
            image: '/images/lavender-candle.jpg',
            stock: true,
          },
          {
            id: 4,
            name: 'Dark Chocolate Truffles',
            description: 'Box of 9',
            price: 22.00,
            category: 'chocolates',
            image: '/images/truffles.jpg',
            stock: false,
          },
          {
            id: 5,
            name: 'Cinnamon Apple Candle',
            description: '12oz Mason Jar',
            price: 27.99,
            category: 'candles',
            image: '/images/cinnamon-candle.jpg',
            stock: true,
          },
          {
            id: 6,
            name: 'Oatmeal Raisin Cookies',
            description: 'Box of 12',
            price: 18.50,
            category: 'cookies',
            image: '/images/oatmeal-cookie.jpg',
            stock: true,
          },
        ];
        
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const handleFilterChange = (filters) => {
    let result = [...products];
    
    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(product => product.category === filters.category);
    }
    
    // Apply stock filter
    if (filters.stock) {
      result = result.filter(product => product.stock);
    }
    
    // Apply new arrivals filter
    if (filters.newArrivals) {
      result = result.filter(product => product.isNew);
    }
    
    // Apply sorting
    switch (filters.sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => b.isNew - a.isNew);
        break;
      default:
        // Default sorting (perhaps by ID or name)
        break;
    }
    
    setFilteredProducts(result);
  };

  return (
    <>
      <Head>
        <title>Shop | flame&crumble</title>
        <meta name="description" content="Browse our handcrafted products" />
      </Head>
      
      
      <main className="min-h-screen py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className='absolute opacity-100 z-100 inset-0'>
                <Navbar />

          </div>
        {/* <h1 className="text-3xl font-bold mb-2">flame&crumble</h1> */}
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - would be more complex in a real app */}
          <div className="md:w-1/4">
            <h2 className="text-xl font-semibold mb-4">All</h2>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <a 
                    href={`/shop?category=${category.toLowerCase()}`} 
                    className="hover:text-[#E30B5D] transition-colors"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Main content */}
          <div className="md:w-3/4">
            <ProductFilter 
              categories={categories} 
              onFilterChange={handleFilterChange} 
            />
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-lg">No products match your filters.</p>
                    <button 
                      onClick={() => handleFilterChange({
                        category: 'all',
                        sort: 'default',
                        stock: false,
                        newArrivals: false,
                      })}
                      className="mt-4 text-[#E30B5D] hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {filteredProducts.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* <Footer /> */}
    </>
  );
}