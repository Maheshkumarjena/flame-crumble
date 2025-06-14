'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import CartSummary from '@/components/Cart/CartSummary';
import CartItem from '@/components/Cart/CartItem';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItemQuantity, removeCartItem } from '@/lib/features/auth/cartSlice';
import { selectIsAuthenticated, selectAuthLoading, selectAuthError } from '@/lib/features/auth/authSlice'; // Import selectAuthError here
import { checkAuthStatus } from '@/lib/features/auth/authSlice';

export default function Cart() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get state from Redux store
  const isAuthenticated = useSelector(selectIsAuthenticated); // FIX: Call useSelector with the selector
  const authLoading = useSelector(selectAuthLoading);
  // const authUser = useSelector(selectAuthUser); // This selector is not used in the component, can be removed if not needed.
  const cart = useSelector((state) => state.cart.items);
  const loadingCart = useSelector((state) => state.cart.loading);
  // Access the error object from the cart slice and extract its message
  const cartErrorObject = useSelector((state) => state.cart.error);
  const cartErrorMessage = cartErrorObject?.message; // Extract the message

  // Access the error object from the auth slice and extract its message for a more robust check
  const authErrorObject = useSelector(selectAuthError);
  const authErrorMessage = authErrorObject?.message;

  const [localCartSuccessMessage, setLocalCartSuccessMessage] = useState('');
  const [localCartErrorMessage, setLocalCartErrorMessage] = useState('');
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);

  // Effect to check auth status on component mount
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Effect to handle auth state changes and redirection
  useEffect(() => {
    // Only proceed if authLoading is false and initial check hasn't been marked done yet.
    // This ensures we react to the *completion* of the auth check.
    if (!authLoading && !initialAuthCheckDone) {
      setInitialAuthCheckDone(true); // Mark initial check as done

      if (!isAuthenticated) {
        // If not authenticated after the check, redirect
        router.push(`/auth/login?returnUrl=${encodeURIComponent('/cart')}`);
      }
    }
  }, [isAuthenticated, authLoading, router, initialAuthCheckDone]); // Added initialAuthCheckDone to dependency array

  // Effect to fetch cart only after auth is confirmed AND initialAuthCheckDone is true
  useEffect(() => {
    if (isAuthenticated && initialAuthCheckDone) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, initialAuthCheckDone, dispatch]);


  // Handle quantity update
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    setLocalCartSuccessMessage('');
    setLocalCartErrorMessage('');

    const resultAction = await dispatch(updateCartItemQuantity({ itemId, newQuantity }));

    if (updateCartItemQuantity.fulfilled.match(resultAction)) {
      setLocalCartSuccessMessage('Cart item quantity updated!');
      setTimeout(() => setLocalCartSuccessMessage(''), 3000);
    } else {
      // Access the error message from the payload, which is expected to be an object from handleAuthError
      setLocalCartErrorMessage(resultAction.payload?.message || 'Failed to update cart item.');
      setTimeout(() => setLocalCartErrorMessage(''), 5000);
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId) => {
    setLocalCartSuccessMessage('');
    setLocalCartErrorMessage('');

    const resultAction = await dispatch(removeCartItem(itemId));

    if (removeCartItem.fulfilled.match(resultAction)) {
      setLocalCartSuccessMessage('Item removed from cart!');
      setTimeout(() => setLocalCartSuccessMessage(''), 3000);
    } else {
      // Access the error message from the payload
      setLocalCartErrorMessage(resultAction.payload?.message || 'Failed to remove item from cart.');
      setTimeout(() => setLocalCartErrorMessage(''), 5000);
    }
  };

  // Calculate cart totals
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
    0
  );
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  // Show loading spinner while checking auth or initial cart load
  // Changed logic to ensure loading spinner only shows when auth is *truly* being checked initially
  if (!initialAuthCheckDone && authLoading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
      </main>
    );
  }

  // If initial auth check is done and user is not authenticated, redirect has already been triggered.
  // We can return null here to avoid rendering the cart page content momentarily.
  if (initialAuthCheckDone && !isAuthenticated) {
    return null;
  }

  // If authenticated but cart is still loading and empty, show spinner
  if (isAuthenticated && loadingCart && cart.length === 0) {
     return (
      <main className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Your Cart | flame&crumble</title>
        <meta name="description" content="Your shopping cart" />
      </Head>

      <Navbar />

      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

        {/* Display cart-specific messages */}
        {localCartSuccessMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md">
            <p>{localCartSuccessMessage}</p>
          </div>
        )}
        {localCartErrorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
            <p>{localCartErrorMessage}</p>
          </div>
        )}
        {/* Display cart error from Redux state */}
        {cartErrorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
                <p>{cartErrorMessage}</p>
            </div>
        )}
        {/* Display auth error from Redux state, if any, that might prevent cart from loading */}
        {authErrorMessage && (
             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
                 <p>Authentication Error: {authErrorMessage}</p>
             </div>
         )}


        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-semibold mb-6">Your Cart ({cart.length})</h2>

            {cart.length === 0 ? (
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
                {cart.map(cartItem => (
                  <CartItem
                    key={cartItem._id}
                    item={{
                      id: cartItem._id,
                      productId: cartItem.product?._id,
                      name: cartItem.product?.name,
                      price: cartItem.product?.price,
                      quantity: cartItem.quantity,
                      image: cartItem.product?.image,
                    }}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="lg:w-1/3">
              <CartSummary
                subtotal={subtotal}
                shipping={shipping}
                total={total}
              />

              <div className="mt-6 space-y-4">
                <Link
                  href="/checkout"
                  className={`block w-full bg-[#E30B5D] text-white text-center py-3 rounded font-medium transition-colors
                    ${loadingCart ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#c5094f]'}`}
                  aria-disabled={loadingCart}
                  onClick={(e) => {
                    if (loadingCart) {
                      e.preventDefault();
                      alert('Please wait for current cart updates to complete before checking out.');
                    }
                  }}
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