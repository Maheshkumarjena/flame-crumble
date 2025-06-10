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
import { selectIsAuthenticated, selectAuthLoading, selectAuthUser } from '@/lib/features/auth/selector';
import { checkAuthStatus } from '@/lib/features/auth/authSlice';

export default function Cart() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get state from Redux store
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);
  const authUser = useSelector(selectAuthUser);
  const cart = useSelector((state) => state.cart.items);
  const loadingCart = useSelector((state) => state.cart.loading);
  const cartError = useSelector((state) => state.cart.error);

  const [localCartSuccessMessage, setLocalCartSuccessMessage] = useState('');
  const [localCartErrorMessage, setLocalCartErrorMessage] = useState('');
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);

  // Effect to check auth status on component mount
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Effect to handle auth state changes
  useEffect(() => {
    if (!authLoading) {
      setInitialAuthCheckDone(true);
      
      if (!isAuthenticated) {
        router.push(`/auth/login?returnUrl=${encodeURIComponent('/cart')}`);
      }
    }
  }, [isAuthenticated, authLoading, router]);

  // Effect to fetch cart only after auth is confirmed
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
      setLocalCartErrorMessage(resultAction.payload?.error || 'Failed to update cart item.');
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
      setLocalCartErrorMessage(resultAction.payload?.error || 'Failed to remove item from cart.');
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
  if ((authLoading && !initialAuthCheckDone) || (isAuthenticated && loadingCart && cart.length === 0)) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
      </main>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated && !authLoading) {
    return null;
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
        {cartError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
                <p>{cartError}</p>
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