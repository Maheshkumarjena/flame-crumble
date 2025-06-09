'use client';
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import ProductCard from '@/components/Product/ProductCard';
import ProductFilter from '@/components/Product/ProductFilter';
import axios from 'axios';

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
    const [totalProducts, setTotalProducts] = useState(0); // Total number of products from backend (adjusted for array response)
    const [currentFilters, setCurrentFilters] = useState({ // Store active filters
        category: 'all',
        sort: 'default',
        stock: false,
        newArrivals: false,
    });

    const categories = ['candles', 'cookies', 'chocolates'];

    // Helper function to apply filters to the current `products` state
    // This is purely for client-side filtering if the backend doesn't support it directly,
    // or for re-sorting if the backend only sends raw data.
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
                // Assuming 'isFeatured' can be used as a proxy for newest,
                // or ideally use a 'createdAt' timestamp if available from backend.
                // Example if using createdAt: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)); // Sort by isFeatured (true first)
                break;
            default:
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        setFilteredProducts(result);
    }, []); // No dependencies here, as it operates on arguments and state setters

    // Function to fetch products from the backend API with pagination
    // `append` parameter determines if new products should be appended or replace existing ones
    const fetchProducts = useCallback(async (page, filters, append = false) => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: page,
                limit: PRODUCTS_PER_PAGE,
                // Sending filter parameters to the backend.
                // Your backend API at `${BACKEND_URL}/api/products` MUST support these query parameters
                // (e.g., ?category=candles&inStock=true&sortBy=price-asc) for filtering and sorting.
                category: filters.category !== 'all' ? filters.category : undefined,
                inStock: filters.stock ? true : undefined, // Assuming backend expects 'true' boolean
                isFeatured: filters.newArrivals ? true : undefined, // Assuming 'isFeatured' represents new arrivals
                sortBy: filters.sort,
            };

            const response = await axios.get(`${BACKEND_URL}/api/products`, { params });

            // FIX: Your backend directly returns an array of products, not an object with 'products' and 'totalProducts'.
            const newProducts = response.data; // response.data is directly the array of products

            // Heuristic for total products and hasMore when backend only returns an array
            // If the number of products returned equals the limit, assume there might be more.
            // This is less accurate than a backend-provided 'totalProducts' count.
            const totalCountEstimate = append ? products.length + newProducts.length : newProducts.length;
            setTotalProducts(totalCountEstimate);

            let updatedProducts;
            if (append) {
                // Use functional update to get the latest `prevProducts`
                setProducts(prevProducts => {
                    updatedProducts = [...prevProducts, ...newProducts];
                    return updatedProducts;
                });
            } else {
                updatedProducts = newProducts;
                setProducts(newProducts);
            }
            setCurrentPage(page);

            // Set hasMore based on whether we received a full page of products
            setHasMore(newProducts.length === PRODUCTS_PER_PAGE);

            // Apply filters on the newly fetched/updated 'products' array
            applyFrontendFilters(updatedProducts, filters);

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
    }, [applyFrontendFilters, products]); // `products` is here because `totalCountEstimate` depends on `products.length` for append.

    // Initial fetch when component mounts
    useEffect(() => {
        fetchProducts(1, currentFilters, false); // Fetch first page with initial filters
    }, []); // Run once on mount

    // Handler for applying filters from ProductFilter component
    const handleFilterChange = (newFilters) => {
        setCurrentFilters(newFilters); // Update current filters state
        // When filters change, reset to page 1 and fetch new data (not appending)
        fetchProducts(1, newFilters, false);
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
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
                        <p>{error}</p>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Main content area for product display */}
                    <div className="w-full"> {/* Changed to w-full as sidebar is commented out */}
                        {/* ProductFilter component, passing the lowercase categories */}
                        <ProductFilter
                            categories={categories.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }))}
                            onFilterChange={handleFilterChange}
                            initialFilters={currentFilters} // Pass current filters to reset correctly if needed
                        />

                        {/* Loading spinner for initial load or when no products are loaded yet */}
                        {loading && products.length === 0 && !error ? (
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
                                            description: product.description || 'No description available',
                                            price: product.price,
                                            category: product.category,
                                            // Prepend '/images/' to the image path from the backend
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