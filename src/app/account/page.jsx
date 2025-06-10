'use client';
import { useState, useEffect, useCallback, useRef } from 'react'; // Import useRef
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { FiEdit, FiPlus, FiChevronRight, FiClock, FiCheckCircle, FiTruck, FiShoppingCart, FiUser, FiMapPin, FiPackage, FiX, FiSave, FiTrash2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/lib/features/auth/cartSlice';
import {  setAuthUser } from '@/lib/features/auth/authSlice';
import axios from 'axios';
import { selectIsAuthenticated, selectAuthUser, selectAuthLoading } from '@/lib/features/auth/selector';

// Import new components
import OrderHistory from '@/components/UserAccount/OrderHistory';
import AddressManagement from '@/components/UserAccount/AddressManagement';
import AccountDetailsSection from '@/components/UserAccount/AccountDetailsSection';


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function UserAccount() {
  const [activeTab, setActiveTab] = useState('orders');
  // Use a single loading state for the entire page's readiness
  const [pageLoading, setPageLoading] = useState(true); 
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  const router = useRouter();
  const dispatch = useDispatch();

  // We will *not* directly rely on isAuthenticated/authLoading from Redux for the initial page load logic
  // to avoid the race condition during hydration. Instead, we'll mimic Wishlist's explicit check.
  // We still select authUser from Redux to pass to child components and display the welcome message.
  const authUser = useSelector(selectAuthUser); 

  const [localMessage, setLocalMessage] = useState({ type: '', text: '' });

  // Function to display local messages for user feedback
  const displayLocalMessage = (type, text) => {
    setLocalMessage({ type, text });
    setTimeout(() => setLocalMessage({ type: '', text: '' }), 3000);
  };

  // Helper to check authentication status (similar to checkAuthStatus in authUtils.js)
  // This function would typically make an API call to validate the session.
  const checkSessionAuth = useCallback(async () => {
    try {
      // This endpoint should return 200 if authenticated, 401/403 otherwise.
      const response = await axios.get(`${BACKEND_URL}/api/auth/status`, {
        withCredentials: true,
      });
      // If the response is successful, it means the user is logged in
      return response.data.loggedIn; 
    } catch (err) {
      console.error("Session check failed:", err);
      // If session check fails (e.g., token expired, network error), consider user as not logged in
      return false;
    }
  }, []);

  // Fetches addresses for the logged-in user
  const fetchAddresses = useCallback(async () => {
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/addresses`, {
        withCredentials: true,
      });
      setAddresses(response.data.addresses);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err.response?.data?.error || 'Failed to load addresses.');
      throw err; // Re-throw to propagate error for Promise.all
    }
  }, []);

  // Fetches orders for the logged-in user
  const fetchOrders = useCallback(async () => {
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/orders`, {
        withCredentials: true,
      });
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || 'Failed to load orders.');
      throw err; // Re-throw to propagate error for Promise.all
    }
  }, []);

  // Main effect for authentication and data loading on component mount/update
  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true); // Start loading for the entire page

      const isLoggedIn = await checkSessionAuth(); // Perform the explicit session check

      if (isLoggedIn) {
        try {
          // If the `authUser` state from Redux is null here, it means the Redux store
          // hasn't fully hydrated `authUser`. You might need to dispatch an action
          // to fetch user details here if `checkSessionAuth` doesn't populate it and it's needed for rendering.
          // For now, we assume `selectAuthUser` will eventually get populated by your auth setup.
          await Promise.all([
            fetchAddresses(),
            fetchOrders()
          ]);
        } catch (err) {
          // Error in fetching addresses/orders, set error and keep page loading for error display
          console.error("Error fetching user data after successful auth:", err);
          setError("Failed to load user data. Please try again.");
          // Optionally, redirect if data fetching fails critically
          // router.push(`/auth/login?returnUrl=${encodeURIComponent('/account')}`);
        } finally {
          setPageLoading(false); // Stop loading once all data (or error) is handled
        }
      } else {
        // Not logged in, redirect to login page
        router.push(`/auth/login?returnUrl=${encodeURIComponent('/account')}`);
        setPageLoading(false); // Stop loading, as we are redirecting
      }
    };

    initializePage();
  }, [checkSessionAuth, fetchAddresses, fetchOrders, router]); // Dependencies updated

  // Show loading spinner if the page is in its overall loading state
  if (pageLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E30B5D]"></div>
      </main>
    );
  }

  // If pageLoading is false and authUser is null, it means the checkSessionAuth failed
  // and router.push was called. So, this component won't render its main content.
  // This is a safeguard, as the redirect should have already taken effect.
  if (!authUser) {
    return null; // Should ideally not be reached if redirect works correctly
  }

  return (
    <>
      <Head>
        <title>My Account | flame&crumble</title>
        <meta name="description" content="Your account dashboard" />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-inter">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">My Account</h1>
            <p className="text-lg text-gray-600 mt-2">Welcome back, <span className="font-semibold text-[#E30B5D]">{authUser.name?.split(' ')[0] || 'User'}</span>!</p>
          </div>

          {/* Local message display */}
          {localMessage.text && (
            <div className={`mb-6 p-4 rounded-lg ${localMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'} flex items-center justify-between`}>
              <p className="flex-grow">{localMessage.text}</p>
              <button onClick={() => setLocalMessage({ type: '', text: '' })} className="text-lg font-semibold ml-4">&times;</button>
            </div>
          )}
          {/* General error message for fetches */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 p-4 mb-6 rounded-lg flex items-center justify-between">
              <p className="flex-grow">{error}</p>
              <button onClick={() => setError(null)} className="text-lg font-semibold ml-4">&times;</button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-1/4">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-100">
                <div className="space-y-2">
                  <SidebarButton icon={FiPackage} label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                  <SidebarButton icon={FiMapPin} label="Addresses" active={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')} />
                  <SidebarButton icon={FiUser} label="Account Details" active={activeTab === 'account'} onClick={() => setActiveTab('account')} />
                </div>
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="lg:hidden mb-6 w-full overflow-x-auto">
              <div className="flex bg-white rounded-xl shadow-lg p-2 border border-gray-100">
                <MobileTabButton icon={FiPackage} label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                <MobileTabButton icon={FiMapPin} label="Addresses" active={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')} />
                <MobileTabButton icon={FiUser} label="Account" active={activeTab === 'account'} onClick={() => setActiveTab('account')} />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {activeTab === 'orders' && (
                <OrderHistory
                  orders={orders}
                  BACKEND_URL={BACKEND_URL}
                  displayLocalMessage={displayLocalMessage}
                />
              )}

              {activeTab === 'addresses' && (
                <AddressManagement
                  addresses={addresses}
                  fetchAddresses={fetchAddresses}
                  BACKEND_URL={BACKEND_URL}
                  displayLocalMessage={displayLocalMessage}
                />
              )}

              {activeTab === 'account' && (
                <AccountDetailsSection
                  authUser={authUser} 
                  dispatch={dispatch}
                  setAuthUser={setAuthUser}
                  BACKEND_URL={BACKEND_URL}
                  displayLocalMessage={displayLocalMessage}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// Reusable Sidebar Button Component
const SidebarButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-lg flex items-center font-medium transition-all duration-200 
      ${active ? 'bg-[#E30B5D] text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-[#E30B5D]'}`}
  >
    <Icon className={`mr-3 text-xl ${active ? 'text-white' : 'text-gray-500 group-hover:text-[#E30B5D]'}`} />
    <span>{label}</span>
    <FiChevronRight className={`ml-auto text-lg ${active ? 'text-white' : 'text-gray-400'}`} />
  </button>
);

// Reusable Mobile Tab Button Component
const MobileTabButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 text-center py-2 px-3 flex flex-col items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 mx-1
      ${active ? 'bg-[#E30B5D] text-white shadow' : 'text-gray-600 hover:bg-gray-100 hover:text-[#E30B5D]'}`}
  >
    <Icon className={`text-xl mb-1 ${active ? 'text-white' : 'text-gray-500'}`} />
    <span className="whitespace-nowrap">{label}</span>
  </button>
);
