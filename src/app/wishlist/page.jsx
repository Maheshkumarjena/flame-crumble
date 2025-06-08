'use client';
import { useState, useEffect } from 'react'; // Added useEffect
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Imported for redirection
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import WishlistItem from '@/components/Wishlist/WishlistItem';
import axios from 'axios'; // Imported axios
import { checkAuthStatus } from '@/utils/authUtils'; // Import the authentication utility function

// Define your backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(''); // State to manage error messages
  const router = useRouter(); // Initialize useRouter for redirection

  // Function to fetch the user's wishlist from the backend
  const fetchWishlist = async () => {
    setLoading(true); // Set loading to true before fetching
    setError(''); // Clear any previous errors
    try {
      const response = await axios.get(`${BACKEND_URL}/api/wishlist`, {
        withCredentials: true, // Important: Sends HTTP-only cookies (JWT token) with the request
      });
      // Assuming the backend returns the wishlist in a structure like { items: [...] }
      setWishlistItems(response.data.items); 
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        // If the server responds with 401 (Unauthorized) or 403 (Forbidden), redirect to login
        if (err.response.status === 401 || err.response.status === 403) {
          // Redirect to login page, passing the current path as a returnUrl query parameter
          router.push(`/auth/login?returnUrl=${encodeURIComponent('/wishlist')}`);
        } else {
          // Display other backend errors
          setError(err.response.data.error || 'Failed to load wishlist. Please try again.');
        }
      } else {
        // Handle network errors or other unexpected issues
        setError('Network error or unexpected issue. Please check your internet connection.');
      }
    } finally {
      setLoading(false); // Set loading to false after fetch attempt
    }
  };

 useEffect(() => {
    const authenticateAndFetch = async () => {
      const isLoggedIn = await checkAuthStatus();
      if (isLoggedIn) {
        fetchWishlist(); // Only fetch wishlist if logged in
      } else {
        // If not logged in, redirect to the login page
        router.push(`/auth/login?returnUrl=${encodeURIComponent('/wishlist')}`);
      }
    };
    authenticateAndFetch();
  }, []); // Run once on mount

  // Function to remove an item from the wishlist
  const removeItem = async (productId) => {
    setError(''); // Clear any previous errors
    try {
      await axios.delete(`${BACKEND_URL}/api/wishlist/${productId}`, {
        withCredentials: true,
      });
      // After successful removal, refetch the entire wishlist to ensure UI is in sync
      fetchWishlist(); 
      // Optionally, show a success toast/notification
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Failed to remove item from wishlist.');
      } else {
        setError('Network error or unexpected issue.');
      }
    }
  };

  // Function to move an item from the wishlist to the cart
  const moveToCart = async (product) => {
    setError(''); // Clear any previous errors
    try {
      // First, add the product to the cart
      await axios.post(`${BACKEND_URL}/api/cart`, { 
        productId: product._id, // Use the actual product's _id from the fetched item
        quantity: 1 // Default quantity to 1 when moving from wishlist to cart
      }, {
        withCredentials: true,
      });

      // If successfully added to cart, then remove it from the wishlist
      await removeItem(product._id); 
      // Optionally, show a success toast/notification: "Item moved to cart successfully!"
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Failed to move item to cart.');
      } else {
        setError('Network error or unexpected issue.');
      }
    }
  };

  return (
    <>
      <Head>
        <title>My Wishlist | flame&crumble</title>
        <meta name="description" content="Your saved items" />
      </Head>
      
      {/* Navbar and Footer components should typically wrap the main content or be siblings */}
      <Navbar /> 
      
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">My Wishlist</h2>
          {/* Display loading status or item count */}
          {loading ? (
            <p className="text-gray-600">Loading your wishlist...</p>
          ) : (
            <p className="text-gray-600">{wishlistItems.length} items saved</p>
          )}
        </div>
        
        {/* Display error messages if any */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {/* Conditional rendering based on loading state and wishlist content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg">Fetching your wishlist...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-4">Your wishlist is empty</p>
            <Link 
              href="/shop" 
              className="inline-block bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-2 rounded font-medium transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map(wishlistItem => (
              <WishlistItem
                key={wishlistItem.product._id} // Use the actual product's _id from the backend response
                item={{
                  id: wishlistItem.product._id, // Map backend _id to frontend id
                  name: wishlistItem.product.name,
                  price: wishlistItem.product.price,
                  image: wishlistItem.product.image,
                  // If your Product model includes a 'variant' field, you'd add it here:
                  // variant: wishlistItem.product.variant, 
                }}
                // Pass the full product object to moveToCart as it needs _id for the cart API
                onMoveToCart={() => moveToCart(wishlistItem.product)} 
                // Pass the product _id to removeItem
                onRemove={() => removeItem(wishlistItem.product._id)}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer /> {/* Footer outside main */}
    </>
  );
}
