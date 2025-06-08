'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import CartSummary from '@/components/Cart/CartSummary';
import CartItem from '@/components/Cart/CartItem';
import axios from 'axios';
import { checkAuthStatus } from '@/utils/authUtils'; // Import the authentication utility function

// Define your backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(''); // State to manage error messages
  const router = useRouter(); // Initialize useRouter for redirection

  // Function to fetch the user's cart from the backend
  const fetchCart = async () => {
    setLoading(true); // Set loading to true before fetching
    setError(''); // Clear any previous errors
    try {
      const response = await axios.get(`${BACKEND_URL}/api/cart`, {
        withCredentials: true, // Important: Sends HTTP-only cookies (JWT token) with the request
      });
      // Assuming the backend returns the cart in a structure like { items: [...] }
      setCartItems(response.data.items);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        // Here, we *only* handle non-authentication errors, as authentication is handled by useEffect
        setError(err.response.data.error || 'Failed to load cart. Please try again.');
      } else {
        // Handle network errors or other unexpected issues
        setError('Network error or unexpected issue. Please check your internet connection.');
      }
    } finally {
      setLoading(false); // Set loading to false after fetch attempt
    }
  };

  // useEffect hook to check authentication status and then fetch cart data
  useEffect(() => {
    const authenticateAndFetchCart = async () => {
      const isLoggedIn = await checkAuthStatus();
      if (isLoggedIn) {
        fetchCart(); // Only fetch cart if logged in
      } else {
        // If not logged in, redirect to the login page immediately
        router.push(`/auth/login?returnUrl=${encodeURIComponent('/cart')}`);
      }
    };
    authenticateAndFetchCart();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to update the quantity of an item in the cart via backend API
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1

    setLoading(true); // Indicate loading while updating
    setError('');
    try {
      // Send PATCH request to backend to update item quantity
      const response = await axios.patch(`${BACKEND_URL}/api/cart/${itemId}`, {
        quantity: newQuantity
      }, {
        withCredentials: true,
      });
      // Update local state with the response data (the updated cart)
      setCartItems(response.data.items);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        // Handle specific error for unauthorized/forbidden during update if needed,
        // otherwise rely on general error message.
        if (err.response.status === 401 || err.response.status === 403) {
          router.push(`/auth/login?returnUrl=${encodeURIComponent('/cart')}`);
        } else {
          setError(err.response.data.error || 'Failed to update item quantity.');
        }
      } else {
        setError('Network error or unexpected issue during quantity update.');
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  // Function to remove an item from the cart via backend API
  const removeItem = async (itemId) => {
    setLoading(true); // Indicate loading while removing
    setError('');
    try {
      // Send DELETE request to backend to remove item
      await axios.delete(`${BACKEND_URL}/api/cart/${itemId}`, {
        withCredentials: true,
      });
      // After successful removal, refetch the entire cart to ensure UI is in sync
      fetchCart();
      // Optionally, show a success toast/notification
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        // Handle specific error for unauthorized/forbidden during removal if needed,
        // otherwise rely on general error message.
        if (err.response.status === 401 || err.response.status === 403) {
          router.push(`/auth/login?returnUrl=${encodeURIComponent('/cart')}`);
        } else {
          setError(err.response.data.error || 'Failed to remove item from cart.');
        }
      } else {
        setError('Network error or unexpected issue during item removal.');
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  // Calculate subtotal, shipping, and total dynamically from fetched cart items
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 5.99 : 0; // Only charge shipping if there are items
  const total = subtotal + shipping;

  return (
    <>
      <Head>
        <title>Your Cart | flame&crumble</title>
        <meta name="description" content="Your shopping cart" />
      </Head>

      <Navbar />

      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-semibold mb-6">Your Cart ({cartItems.length})</h2>

            {/* Display error messages if any */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
                <p>{error}</p>
              </div>
            )}

            {/* Conditional rendering based on loading state and cart content */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-lg">Loading your cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg mb-4">Your cart is empty</p>
                <Link
                  href="/shop"
                  className="inline-block bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-2 rounded font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map(cartItem => (
                  <CartItem
                    key={cartItem._id} // Use the unique MongoDB _id for the cart item itself
                    item={{
                      id: cartItem._id, // Pass the cart item's _id to the component
                      productId: cartItem.product._id, // Pass product's _id if needed for other actions
                      name: cartItem.product.name,
                      price: cartItem.product.price,
                      quantity: cartItem.quantity,
                      image: cartItem.product.image,
                      // If your Product model includes a 'variant' field, you'd add it here:
                      // variant: cartItem.product.variant,
                    }}
                    onUpdateQuantity={updateQuantity} // Pass the update function
                    onRemove={removeItem} // Pass the remove function
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary and action buttons, only visible if there are items */}
          {cartItems.length > 0 && (
            <div className="lg:w-1/3">
              <CartSummary
                subtotal={subtotal}
                shipping={shipping}
                total={total}
              />

              <div className="mt-6 space-y-4">
                <Link
                  href="/checkout"
                  className="block w-full bg-[#E30B5D] hover:bg-[#c5094f] text-white text-center py-3 rounded font-medium transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/shop"
                  className="block w-full bg-transparent hover:bg-gray-100 border border-black text-black text-center py-3 rounded font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}