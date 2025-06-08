'use client';
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import ProductCard from '@/components/Product/ProductCard';
import ProductFilter from '@/components/Product/ProductFilter';
import axios from 'axios'; // Import axios

// Define your backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const PRODUCTS_PER_PAGE = 9; // Define how many products to fetch per page

export default function Shop() {
  const [products, setProducts] = useState([]); // Stores all loaded products (accumulated)
  const [filteredProducts, setFilteredProducts] = useState([]); // Stores products after applying filters
  const [loading, setLoading] = useState(true); // Manages loading state
  const [error, setError] = useState(''); // Manages error messages
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [hasMore, setHasMore] = useState(true); // Indicates if there are more pages to load
  const [totalProducts, setTotalProducts] = useState(0); // Total number of products from backend
  const [currentFilters, setCurrentFilters] = useState({ // Store active filters
    category: 'all',
    sort: 'default',
    stock: false,
    newArrivals: false,
  });

  const categories = ['candles', 'cookies', 'chocolates'];

  // Function to fetch products from the backend API with pagination
  // `append` parameter determines if new products should be appended or replace existing ones
  const fetchProducts = useCallback(async (page, filters, append = false) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: page,
        limit: PRODUCTS_PER_PAGE,
        // Add backend filter parameters if your API supports them directly
        // For now, filtering is done on the frontend. If backend filtering is implemented,
        // uncomment and send relevant filter params here.
        // category: filters.category !== 'all' ? filters.category : undefined,
        // inStock: filters.stock ? true : undefined,
        // isFeatured: filters.newArrivals ? true : undefined,
        // sortBy: filters.sort,
      };

      const response = await axios.get(`${BACKEND_URL}/api/products`, { params });
      
      const { products: newProducts, totalProducts: totalCount } = response.data;
      
      if (append) {
        // Append new products to the existing list
        setProducts(prevProducts => [...prevProducts, ...newProducts]);
      } else {
        // Replace products (e.g., initial load or filter change)
        setProducts(newProducts);
      }
      setTotalProducts(totalCount);
      setCurrentPage(page);

      // Check if there are more products to load
      setHasMore((page * PRODUCTS_PER_PAGE) < totalCount);

      // Re-apply filters on the newly fetched 'products' array
      // This is crucial if filtering is done purely on the frontend after initial fetch/load more
      applyFrontendFilters([...(append ? products : []), ...newProducts], filters);

    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Failed to fetch products from server.');
      } else {
        setError('Network error or unexpected issue. Please check your internet connection.');
      }
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [products]); // Dependency on 'products' to ensure `applyFrontendFilters` uses latest full list

  // Helper function to apply filters to the current `products` state
  const applyFrontendFilters = useCallback((allProds, filters) => {
    let result = [...allProds];

    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(product => product.category.toLowerCase() === filters.category.toLowerCase());
    }
    
    // Apply stock filter (stock > 0 means in stock)
    if (filters.stock) {
      result = result.filter(product => product.stock > 0);
    }
    
    // Apply new arrivals filter (assuming 'isFeatured' from backend can indicate 'new' or use a 'createdAt' timestamp)
    if (filters.newArrivals) {
      result = result.filter(product => product.isFeatured); 
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
        // Assuming 'isFeatured' can be used as a proxy for newest
        result.sort((a, b) => b.isFeatured - a.isFeatured); 
        break;
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    setFilteredProducts(result);
  }, []);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchProducts(1, currentFilters, false); // Fetch first page
  }, []); // Run once on mount

  // Re-apply filters whenever `products` or `currentFilters` change
  useEffect(() => {
    applyFrontendFilters(products, currentFilters);
  }, [products, currentFilters, applyFrontendFilters]);

  // Handler for applying filters from ProductFilter component
  const handleFilterChange = (newFilters) => {
    setCurrentFilters(newFilters); // Update current filters
    setProducts([]); // Clear existing products
    fetchProducts(1, newFilters, false); // Fetch first page with new filters
  };

  // Handler for "Load More" button click
  const handleLoadMore = () => {
    fetchProducts(currentPage + 1, currentFilters, true); // Fetch next page and append
  };

  return (
    <>
      <Head>
        <title>Shop | flame&crumble</title>
        <meta name="description" content="Browse our handcrafted products" />
      </Head>
      
      <Navbar />
      
      <main className="min-h-screen py-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* <h1 className="text-3xl font-bold mb-2">Our Products</h1>  */}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar for categories */}
          {/* <div className="md:w-1/4">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <ul className="space-y-2">
              <li key="all">
                <a 
                  href="/shop?category=all" 
                  onClick={(e) => { e.preventDefault(); handleFilterChange({ ...currentFilters, category: 'all' }); }}
                  className="hover:text-[#E30B5D] transition-colors"
                >
                  All Products
                </a>
              </li>
              {categories.map((category) => (
                <li key={category}>
                  <a 
                    href={`/shop?category=${category}`} 
                    onClick={(e) => { e.preventDefault(); handleFilterChange({ ...currentFilters, category: category }); }}
                    className="hover:text-[#E30B5D] transition-colors"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)} {/* Capitalize for display */}
                  {/* </a> */}
                {/* </li> */}
              {/* ))} */}
            {/* </ul> */}
          {/* </div> */} 
          
          {/* Main content area for product display */}
          <div className="md:w-3/4">
            {/* ProductFilter component, passing the lowercase categories */}
            <ProductFilter 
              categories={categories.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }))}
              onFilterChange={handleFilterChange} 
              initialFilters={currentFilters} // Pass current filters to reset correctly if needed
            />
            
            {loading && products.length === 0 ? ( // Only show spinner on initial load
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    // Use product._id as key and pass the product object directly
                    <ProductCard key={product._id} product={{
                      id: product._id, // Map backend _id to frontend id
                      name: product.name,
                      // Ensure description is part of your Product model in backend
                      // If not, you might need to adjust or remove this prop
                      description: product.description || 'No description available', 
                      price: product.price,
                      category: product.category,
                      // FIX: Prepend '/images/' to the image path from the backend
                      image: product.image.startsWith('/') ? product.image : `/images/${product.image}`,
                      stock: product.stock > 0, // Convert stock number to boolean
                      isNew: product.isFeatured, // Using isFeatured as a proxy for new arrival
                      // bestseller: product.isBestSeller, // Add if you have a bestseller field in backend
                    }} />
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
            
            {/* Load More button */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handleLoadMore} 
                  className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
                  disabled={loading} // Disable button while loading more
                >
                  {loading ? 'Loading More...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
