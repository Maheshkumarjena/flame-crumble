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
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push(`/auth/login?returnUrl=${encodeURIComponent('/wishlist')}`);
          return; // Important to return after redirect
        }
        setFetchError(err.response?.data?.error || 'Failed to load wishlist');
      } else {
        setFetchError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      try {
        // Check auth and fetch in one flow
        await axios.get(`${BACKEND_URL}/api/auth/status`, {
          withCredentials: true,
          signal: controller.signal
        });
        await fetchWishlist();
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            router.push(`/auth/login?returnUrl=${encodeURIComponent('/wishlist')}`);
          } else if (!err.message.includes('canceled')) {
            setFetchError(err.response?.data?.error || 'Authentication check failed');
          }
        }
      }
    };

    loadData();

    return () => controller.abort();
  }, [fetchWishlist, router]);

  const removeItem = async (productId) => {
    setOperationError('');
    try {
      await axios.delete(`${BACKEND_URL}/api/wishlist/${productId}`, {
        withCredentials: true,
      });
      // Optimistic update instead of refetching
      setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
    } catch (err) {
      setOperationError(
        axios.isAxiosError(err) 
          ? err.response?.data?.error || 'Failed to remove item'
          : 'Network error'
      );
      // Revert UI if needed by calling fetchWishlist()
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
      // Optimistic update for both operations
      setWishlistItems(prev => prev.filter(item => item.product._id !== product._id));
    } catch (err) {
      setOperationError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || 'Failed to move to cart'
          : 'Network error'
      );
    }
  };

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
          {loading ? (
            <p className="text-gray-600">Loading your wishlist...</p>
          ) : (
            <p className="text-gray-600">{wishlistItems.length} items saved</p>
          )}
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