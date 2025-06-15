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
import { selectIsAuthenticated, selectAuthLoading, selectAuthError } from '@/lib/features/auth/authSlice';
import { checkAuthStatus } from '@/lib/features/auth/authSlice';

export default function Cart() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get state from Redux store
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);
  const cart = useSelector((state) => state.cart.items);
  const loadingCart = useSelector((state) => state.cart.loading);
  const cartErrorObject = useSelector((state) => state.cart.error);
  const cartErrorMessage = cartErrorObject?.message;

  const authErrorObject = useSelector(selectAuthError);
  const authErrorMessage = authErrorObject?.message;

  const [localCartSuccessMessage, setLocalCartSuccessMessage] = useState('');
  const [localCartErrorMessage, setLocalCartErrorMessage] = useState('');
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);

  // Effect to check auth status on component mount
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Effect to mark initial auth check as done once loading is complete
  useEffect(() => {
    if (!authLoading && !initialAuthCheckDone) {
      setInitialAuthCheckDone(true);
    }
  }, [authLoading, initialAuthCheckDone]);

  // Effect to fetch cart only after auth is confirmed and initialAuthCheckDone is true
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

  // Show loading spinner while checking auth initially
  if (!initialAuthCheckDone && authLoading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
      </main>
    );
  }

  // --- Start of new logic for unauthenticated state ---
  if (initialAuthCheckDone && !isAuthenticated) {
    return (
      <>
        <Head>
          <title>Your Cart | flame&crumble</title>
          <meta name="description" content="Your shopping cart" />
        </Head>

        <Navbar />

        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl font-bold mb-4">Login to access Your Shopping Cart</h2>
            <p className="text-gray-700 mb-6">
              Please log in to view and manage items in your cart. Your cart is saved across devices when you're logged in!
            </p>
            <Link
              href={`/auth/login?returnUrl=${encodeURIComponent('/cart')}`}
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
  // --- End of new logic for unauthenticated state ---


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