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
import { resetAuth } from '@/lib/features/auth/authSlice';
import axios from 'axios';
import { selectIsAuthenticated, selectAuthUser, selectAuthLoading } from '@/lib/features/auth/selector';

// Import new components
import OrderHistory from '@/components/UserAccount/OrderHistory';
import AddressManagement from '@/components/UserAccount/AddressManagement';
import AccountDetailsSection from '@/components/UserAccount/AccountDetailsSection';


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function UserAccount() {
  // Initialize activeTab from localStorage or default to 'orders'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') { // Check if window is defined (client-side)
      return localStorage.getItem('activeAccountTab') || 'orders';
    }
    return 'orders'; // Default for server-side rendering or initial hydration
  });
  // Use a single loading state for the entire page's readiness
  const [pageLoading, setPageLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track auth status

  const router = useRouter();
  const dispatch = useDispatch();

  const authUser = useSelector(selectAuthUser); // authUser will be null if not authenticated

  const [localMessage, setLocalMessage] = useState({ type: '', text: '' });

  // Function to display local messages for user feedback
  const displayLocalMessage = useCallback((type, text) => {
    setLocalMessage({ type, text });
    setTimeout(() => setLocalMessage({ type: '', text: '' }), 3000);
  }, []); // useCallback to memoize for useEffect dependencies

  // Helper to check authentication status
  const checkSessionAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/status`, {
        withCredentials: true,
      });
      return response.data.loggedIn;
    } catch (err) {
      console.error("Session check failed:", err);
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
      // Do not set global error here, let the main useEffect handle it if auth fails
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
      // Do not set global error here, let the main useEffect handle it if auth fails
      throw err; // Re-throw to propagate error for Promise.all
    }
  }, []);

  // Effect to save the active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeAccountTab', activeTab);
    }
  }, [activeTab]);


  // Main effect for authentication and data loading on component mount/update
  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true); // Start loading for the entire page
      setError(null); // Clear previous errors

      const isLoggedIn = await checkSessionAuth(); // Perform the explicit session check
      setIsAuthenticated(isLoggedIn); // Set local isAuthenticated state

      if (isLoggedIn) {
        try {
          await Promise.all([
            fetchAddresses(),
            fetchOrders()
          ]);
        } catch (err) {
          // This catch block handles errors specifically from fetchAddresses/fetchOrders
          console.error("Error fetching user data after successful auth:", err);
          setError("Failed to load user data. Please try again.");
        }
      }
      setPageLoading(false); // Stop loading once auth check and data fetch (or lack thereof) are complete
    };

    initializePage();
  }, [checkSessionAuth, fetchAddresses, fetchOrders]); // Dependencies updated

  // --- Conditional Rendering Logic ---

  // Show loading spinner while the initial page data (including auth) is being loaded
  if (pageLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E30B5D]"></div>
      </main>
    );
  }

  // If pageLoading is false and isAuthenticated is false, display the login prompt
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>My Account | flame&crumble</title>
          <meta name="description" content="Your account dashboard" />
        </Head>

        <Navbar />

        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl font-bold mb-4">Login to access Your Account</h2>
            <p className="text-gray-700 mb-6">
              Please log in to view and manage your account details, orders, and addresses.
            </p>
            <Link
              href={`/auth/login?returnUrl=${encodeURIComponent('/account')}`}
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
        <title>My Account | flame&crumble</title>
        <meta name="description" content="Your account dashboard" />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-inter">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">My Account</h1>
            <p className="text-lg text-gray-600 mt-2">Welcome back, <span className="font-semibold text-[#E30B5D]">{authUser?.name?.split(' ')[0] || 'User'}</span>!</p>
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
                  resetAuth={resetAuth}
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