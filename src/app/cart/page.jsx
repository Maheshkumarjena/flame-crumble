'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import CartSummary from '@/components/Cart/CartSummary';
import CartItem from '@/components/Cart/CartItem';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import { fetchCart, updateCartItemQuantity, removeCartItem } from '@/lib/features/auth/cartSlice'; // Import cart thunks
import { selectIsAuthenticated } from '@/lib/features/auth/selector';
import { toast } from 'sonner'; // Ensure you have sonner installed for notifications

export default function Cart() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get state from Redux store using useSelector
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const cart = useSelector((state) => state.cart.items); // Get the cart items directly from Redux state
  const loadingCart = useSelector((state) => state.cart.loading);
  const cartError = useSelector((state) => state.cart.error);

  const [localCartSuccessMessage, setLocalCartSuccessMessage] = useState('');
  const [localCartErrorMessage, setLocalCartErrorMessage] = useState('');

  // Effect to redirect if not logged in and to fetch cart data
  useEffect(() => {
    // If not authenticated and auth check is done, redirect to login
    // The isAuthenticated state is managed by the checkAuthStatus thunk in authSlice
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent('/cart')}`);
    } else {
      // If authenticated, fetch the cart items
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch, router]); // Depend on isAuthenticated and dispatch

  // Handle quantity update
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    setLocalCartSuccessMessage('');
    setLocalCartErrorMessage('');
    
    // Dispatch the optimistic update thunk
    const resultAction = await dispatch(updateCartItemQuantity({ itemId, newQuantity }));

    if (updateCartItemQuantity.fulfilled.match(resultAction)) {
      setLocalCartSuccessMessage('Cart item quantity updated!');
      setTimeout(() => setLocalCartSuccessMessage(''), 3000);
    } else {
      // Error message will be in resultAction.payload if rejected
      setLocalCartErrorMessage(resultAction.payload?.error || 'Failed to update cart item.');
      setTimeout(() => setLocalCartErrorMessage(''), 5000);
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId) => {
    setLocalCartSuccessMessage('');
    setLocalCartErrorMessage('');

    // Dispatch the optimistic remove thunk
    const resultAction = await dispatch(removeCartItem(itemId));

    if (removeCartItem.fulfilled.match(resultAction)) {
      setLocalCartSuccessMessage('Item removed from cart!');
      setTimeout(() => setLocalCartSuccessMessage(''), 3000);
    } else {
      setLocalCartErrorMessage(resultAction.payload?.error || 'Failed to remove item from cart.');
      setTimeout(() => setLocalCartErrorMessage(''), 5000);
    }
  };

  // Calculate subtotal, shipping, and total dynamically from Redux cart items
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), // Use optional chaining for product.price and quantity
    0
  );
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  // Show loading spinner if authentication is being checked or cart is loading
  // (You might want to check for auth.loading as well if that affects page display)
  if (loadingCart && cart.length === 0) { // Only show loading if cart is empty initially
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
        {cartError && ( // Display persistent errors from Redux state (e.g., failed initial fetch)
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
                    key={cartItem._id} // Use the unique MongoDB _id for the cart item itself
                    item={{
                      id: cartItem._id, // Cart item's _id for update/remove actions
                      productId: cartItem.product?._id, // Product's _id
                      name: cartItem.product?.name,
                      price: cartItem.product?.price,
                      quantity: cartItem.quantity,
                      image: cartItem.product?.image, // Image path, handle in CartItem component
                      // variant: cartItem.product?.variant, // Add if Product model has this
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
                  // Disable checkout button if any cart operation is pending
                  aria-disabled={loadingCart}
                  onClick={(e) => { 
                    if (loadingCart) { 
                      e.preventDefault(); 
                      toast('Please wait for current cart updates to complete before checking out.');
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
