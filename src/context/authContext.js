'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Stores { id, name, email, role, isVerified }
  const [wishlist, setWishlist] = useState([]); // Stores wishlist items (populated product objects)
  const [cart, setCart] = useState([]);     // Stores cart items (populated product objects)
  const [loadingAuth, setLoadingAuth] = useState(true); // Tracks initial auth check loading
  const [loadingCart, setLoadingCart] = useState(false); // Loading state for cart operations
  const [loadingWishlist, setLoadingWishlist] = useState(false); // Loading state for wishlist operations
  const [authError, setAuthError] = useState(null); // General auth related errors
  const [cartError, setCartError] = useState(null); // Cart related errors
  const [wishlistError, setWishlistError] = useState(null); // Wishlist related errors

  const router = useRouter();

  // Derived values for convenience
  const isLoggedIn = !!user?.id;
  const isAdmin = user?.role === 'admin';

  // --- Core Authentication Functions ---

    const fetchCart = useCallback(async () => {
    if (!isLoggedIn) { // Only fetch if user is logged in
      setCart([]);
      return;
    }
    setLoadingCart(true);
    setCartError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/cart`, {
        withCredentials: true,
      });
      setCart(response.data.items); // Assuming items are populated products
    } catch (error) {
      console.error('Failed to fetch user cart:', error);
      if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
        setUser(null); // Clear user, will trigger re-check via useEffect
        setCart([]);
        router.push(`/auth/login?returnUrl=${encodeURIComponent(router.pathname)}`);
      } else {
        setCartError(error.response?.data?.error || 'Failed to load cart.');
      }
    } finally {
      setLoadingCart(false);
    }
  }, [isLoggedIn, router, user]); // Include 'user' in dependency to re-run if user object changes



    const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn) { // Only fetch if user is logged in
      setWishlist([]);
      return;
    }
    setLoadingWishlist(true);
    setWishlistError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/wishlist`, {
        withCredentials: true,
      });
      setWishlist(response.data.items); // Assuming items are populated products
    } catch (error) {
      console.error('Failed to fetch user wishlist:', error);
      // Specific error handling for 401/403 (handled by checkAuthStatus, but for safety)
      if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
        // This case should ideally be caught by checkAuthStatus and redirect,
        // but if it happens mid-session, we can trigger a re-check or redirect.
        setUser(null);
        setWishlist([]);
        router.push(`/auth/login?returnUrl=${encodeURIComponent(router.pathname)}`);
      } else {
        setWishlistError(error.response?.data?.error || 'Failed to load wishlist.');
      }
    } finally {
      setLoadingWishlist(false);
    }
  }, [isLoggedIn, router, user]); // Include 'user' in dependency to re-run if user object changes


  // Function to check authentication status and update user state
  const checkAuthStatus = useCallback(async () => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/status`, {
        withCredentials: true,
      });
      // Backend's status endpoint should return { loggedIn: true, id, name, email, role, isVerified }
      setUser(response.data);
      // Fetch wishlist and cart immediately if user is logged in
      await Promise.all([fetchWishlist(), fetchCart()]); 
      return true;
    } catch (error) {
      console.log('User not authenticated (checkAuthStatus):', error.response?.statusText || error.message);
      setUser(null); // Clear user data if not authenticated
      setWishlist([]); // Clear wishlist
      setCart([]);     // Clear cart
      // Do not setAuthError for 401/403 as it's a normal "not logged in" state,
      // but for other errors, set it.
      if (axios.isAxiosError(error) && error.response && error.response.status !== 401 && error.response.status !== 403) {
        setAuthError(error.response?.data?.error || 'Failed to check authentication status.');
      }
      return false;
    } finally {
      setLoadingAuth(false);
    }
  }, []); // No dependencies for checkAuthStatus itself

  // Function to log in the user and update context
  const login = useCallback(async (email, password) => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password }, {
        withCredentials: true,
      });
      setUser(response.data.user); // Assuming login returns { user: { id, name, email, role, isVerified } }
      await Promise.all([fetchWishlist(), fetchCart()]); // Fetch initial wishlist and cart
      setLoadingAuth(false);
      return { success: true };
    } catch (error) {
      setLoadingAuth(false);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchWishlist, fetchCart]);

  // Function to log out the user
  const logout = useCallback(async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      });
      setUser(null);
      setWishlist([]);
      setCart([]);
      setAuthError(null);
      setCartError(null);
      setWishlistError(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error.response?.data?.error || error.message);
      setAuthError(error.response?.data?.error || 'Logout failed. Please try again.');
    }
  }, [router]);

  // --- Wishlist Functions ---


  const toggleWishlistItem = useCallback(async (productId) => {
    if (!isLoggedIn) {
      setWishlistError('Please log in to manage your wishlist.');
      router.push(`/auth/login?returnUrl=${encodeURIComponent(router.pathname)}`);
      return false;
    }

    setLoadingWishlist(true);
    setWishlistError(null);
    try {
      const isCurrentlyInWishlist = wishlist.some(item => item.product._id === productId);
      if (isCurrentlyInWishlist) {
        await axios.delete(`${BACKEND_URL}/api/wishlist/${productId}`, {
          withCredentials: true,
        });
        setWishlist(prevList => prevList.filter(item => item.product._id !== productId));
      } else {
        await axios.post(`${BACKEND_URL}/api/wishlist`, { productId }, {
          withCredentials: true,
        });
        // After adding, we need to re-fetch the wishlist to get the populated product data
        await fetchWishlist(); // Re-fetch to get the full populated object including product details
      }
      return true; // Operation successful
    } catch (error) {
      console.error('Failed to toggle wishlist item:', error);
      setWishlistError(error.response?.data?.error || 'Failed to update wishlist.');
      return false; // Operation failed
    } finally {
      setLoadingWishlist(false);
    }
  }, [isLoggedIn, wishlist, fetchWishlist, router]);

  // --- Cart Functions ---


  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isLoggedIn) {
      setCartError('Please log in to add items to cart.');
      router.push(`/auth/login?returnUrl=${encodeURIComponent(router.pathname)}`);
      return false;
    }

    setLoadingCart(true);
    setCartError(null);
    try {
      await axios.post(`${BACKEND_URL}/api/cart`, { productId, quantity }, {
        withCredentials: true,
      });
      await fetchCart(); // Re-fetch cart to get updated populated items
      return true; // Operation successful
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setCartError(error.response?.data?.error || 'Failed to add item to cart.');
      return false; // Operation failed
    } finally {
      setLoadingCart(false);
    }
  }, [isLoggedIn, fetchCart, router]);

  const updateCartItemQuantity = useCallback(async (itemId, newQuantity) => {
    if (!isLoggedIn) {
      setCartError('Please log in to update your cart.');
      router.push(`/auth/login?returnUrl=${encodeURIComponent(router.pathname)}`);
      return false;
    }
    if (newQuantity < 1) {
      setCartError('Quantity cannot be less than 1.');
      return false;
    }

    setLoadingCart(true);
    setCartError(null);
    try {
      await axios.patch(`${BACKEND_URL}/api/cart/${itemId}`, { quantity: newQuantity }, {
        withCredentials: true,
      });
      await fetchCart(); // Re-fetch cart to get updated populated items
      return true;
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
      setCartError(error.response?.data?.error || 'Failed to update cart item.');
      return false;
    } finally {
      setLoadingCart(false);
    }
  }, [isLoggedIn, fetchCart, router]);

  const removeCartItem = useCallback(async (itemId) => {
    if (!isLoggedIn) {
      setCartError('Please log in to modify your cart.');
      router.push(`/auth/login?returnUrl=${encodeURIComponent(router.pathname)}`);
      return false;
    }

    setLoadingCart(true);
    setCartError(null);
    try {
      await axios.delete(`${BACKEND_URL}/api/cart/${itemId}`, {
        withCredentials: true,
      });
      await fetchCart(); // Re-fetch cart to get updated populated items
      return true;
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      setCartError(error.response?.data?.error || 'Failed to remove cart item.');
      return false;
    } finally {
      setLoadingCart(false);
    }
  }, [isLoggedIn, fetchCart, router]);

  // Initial authentication check on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // Only run once on mount or if checkAuthStatus changes (shouldn't happen)

  const value = {
    user,
    setUser, // Exposed for login/register pages to directly set user after successful operations
    isLoggedIn,
    isAdmin,
    loadingAuth,
    authError,
    checkAuthStatus,
    login,
    logout,

    wishlist,
    loadingWishlist,
    wishlistError,
    fetchWishlist,
    toggleWishlistItem, // Use this for adding/removing from UI

    cart,
    loadingCart,
    cartError,
    fetchCart,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
