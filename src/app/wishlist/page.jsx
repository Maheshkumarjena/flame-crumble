'use client';
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import WishlistItem from '@/components/Wishlist/WishlistItem';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [operationError, setOperationError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // New state to track authentication status
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false); // New state for initial check
  const router = useRouter();

  // Memoized fetch function with proper error handling
  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const response = await axios.get(`${BACKEND_URL}/api/wishlist`, {
        withCredentials: true,
      });
      setWishlistItems(response.data.items);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // We no longer redirect here; the main useEffect handles unauthenticated state
        setFetchError(err.response?.data?.error || 'Failed to load wishlist');
      } else {
        setFetchError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []); // No need for router in dependencies here as redirect is handled elsewhere

  // Effect to check auth status and then fetch wishlist
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const checkAuthAndFetchWishlist = async () => {
      setLoading(true); // Indicate loading while checking auth and fetching
      setFetchError('');

      try {
        const authResponse = await axios.get(`${BACKEND_URL}/api/auth/status`, {
          withCredentials: true,
          signal: signal,
        });
        // If auth status check is successful, the user is authenticated
        setIsAuthenticated(true);
        await fetchWishlist(); // Fetch wishlist only if authenticated
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            // User is not authenticated. Do NOT redirect here.
            setIsAuthenticated(false);
            setWishlistItems([]); // Clear any stale wishlist data
            setLoading(false); // Stop loading, as we're now displaying the login prompt
          } else if (!signal.aborted) {
            // Handle other errors that are not due to abortion
            setFetchError(err.response?.data?.error || 'Failed to check authentication status or fetch wishlist.');
            setIsAuthenticated(false); // Assume not authenticated on other errors as well
            setLoading(false);
          }
        } else if (!signal.aborted) {
          setFetchError('Network error. Please try again.');
          setIsAuthenticated(false);
          setLoading(false);
        }
      } finally {
        setInitialAuthCheckDone(true); // Mark the initial check as complete
      }
    };

    checkAuthAndFetchWishlist();

    return () => controller.abort(); // Cleanup on unmount
  }, [fetchWishlist]); // fetchWishlist is a dependency, but it's useCallback'd without router

  const removeItem = async (productId) => {
    setOperationError('');
    try {
      await axios.delete(`${BACKEND_URL}/api/wishlist/${productId}`, {
        withCredentials: true,
      });
      setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
    } catch (err) {
      setOperationError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || 'Failed to remove item'
          : 'Network error'
      );
    }
  };

  const moveToCart = async (product) => {
    setOperationError('');
    try {
      await axios.post(`${BACKEND_URL}/api/cart`, {
        productId: product._id,
        quantity: 1
      }, {
        withCredentials: true,
      });
      setWishlistItems(prev => prev.filter(item => item.product._id !== product._id));
    } catch (err) {
      setOperationError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || 'Failed to move to cart'
          : 'Network error'
      );
    }
  };

  // --- Conditional rendering logic ---

  // Show loading spinner initially while authentication and data fetch is in progress
  if (!initialAuthCheckDone || (loading && isAuthenticated)) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
      </main>
    );
  }

  // If initial auth check is done and user is NOT authenticated
  if (initialAuthCheckDone && !isAuthenticated) {
    return (
      <>
        <Head>
          <title>My Wishlist | flame&crumble</title>
          <meta name="description" content="Your saved items" />
        </Head>

        <Navbar />

        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl font-bold mb-4">Login to Access Your Wishlist</h2>
            <p className="text-gray-700 mb-6">
              Please log in to view and manage your saved items. Your wishlist is accessible across all your devices when you're logged in!
            </p>
            <Link
              href={`/auth/login?returnUrl=${encodeURIComponent('/wishlist')}`}
              className="inline-block bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              Go to Login Page
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // Default rendering for authenticated users
  return (
    <>
      <Head>
        <title>My Wishlist | flame&crumble</title>
        <meta name="description" content="Your saved items" />
      </Head>

      <Navbar />

      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">My Wishlist</h2>
          <p className="text-gray-600">{wishlistItems.length} items saved</p>
        </div>

        {fetchError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
            <p>{fetchError}</p>
          </div>
        )}

        {operationError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-md">
            <p>{operationError}</p>
          </div>
        )}

        {wishlistItems.length === 0 ? (
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
                key={wishlistItem.product._id}
                item={{
                  id: wishlistItem.product._id,
                  name: wishlistItem.product.name,
                  price: wishlistItem.product.price,
                  image: wishlistItem.product.image,
                }}
                onMoveToCart={() => moveToCart(wishlistItem.product)}
                onRemove={() => removeItem(wishlistItem.product._id)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}