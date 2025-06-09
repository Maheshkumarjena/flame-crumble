'use client';
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { FiEdit, FiPlus, FiChevronRight, FiClock, FiCheckCircle, FiTruck, FiShoppingCart, FiUser, FiMapPin, FiPackage } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/lib/features/auth/cartSlice';
import axios from 'axios';
import { selectIsAuthenticated, selectAuthUser, selectAuthLoading } from '@/lib/features/auth/selector';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function UserAccount() {
  const [activeTab, setActiveTab] = useState('orders');
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  const router = useRouter();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authUser = useSelector(selectAuthUser);
  const authLoading = useSelector(selectAuthLoading);

  const [localMessage, setLocalMessage] = useState({ type: '', text: '' });

  const fetchAddresses = useCallback(async () => {
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me/addresses`, {
        withCredentials: true,
      });
      setAddresses(response.data.addresses);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err.response?.data?.error || 'Failed to load addresses.');
    }
  }, []);

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
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent('/account')}`);
      return;
    }

    if (isAuthenticated) {
      const loadUserData = async () => {
        setIsLoadingContent(true);
        setError(null);
        try {
          await Promise.all([
            fetchAddresses(),
            fetchOrders()
          ]);
        } catch (err) {
          // Errors are handled within fetchAddresses/fetchOrders
        } finally {
          setIsLoadingContent(false);
        }
      };
      loadUserData();
    }
  }, [isAuthenticated, authLoading, router, fetchAddresses, fetchOrders]);

  const handleAddToCart = async (product) => {
    setLocalMessage({ type: '', text: '' });
    const resultAction = await dispatch(addToCart({ productId: product.id, quantity: 1 }));
    if (addToCart.fulfilled.match(resultAction)) {
      setLocalMessage({ type: 'success', text: `${product.name} added to cart!` });
    } else {
      setLocalMessage({ type: 'error', text: resultAction.payload || 'Failed to add item to cart.' });
    }
    setTimeout(() => setLocalMessage({ type: '', text: '' }), 3000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="text-green-500 mr-2" />;
      case 'shipped':
        return <FiTruck className="text-blue-500 mr-2" />;
      default:
        return <FiClock className="text-yellow-500 mr-2" />;
    }
  };

  const getProductImageUrl = (imagePath) => {
    const placeholder = "https://placehold.co/64x64/e0e0e0/555555?text=No+Image";
    return imagePath
      ? (imagePath.startsWith('/') ? imagePath : `/images/${imagePath}`)
      : placeholder;
  };

  if (authLoading || isLoadingContent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E30B5D]"></div>
      </main>
    );
  }

  if (!authUser) {
    return null;
  }

  return (
    <>
      <Head>
        <title>My Account | flame&crumble</title>
        <meta name="description" content="Your account dashboard" />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
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
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <section className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <header className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Order History</h2>
                  </header>
                  {orders.length === 0 ? (
                    <div className="p-8 text-center bg-white">
                      <FiShoppingCart className="mx-auto text-gray-400 text-6xl mb-4" />
                      <p className="text-gray-500 mb-6 text-lg">You haven't placed any orders yet.</p>
                      <Link href="/shop" className="inline-flex items-center bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-3 rounded-lg text-base font-semibold transition duration-300 ease-in-out transform hover:scale-105">
                        <FiPlus className="mr-2" /> Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <div key={order._id || order.id} className="p-6 bg-white hover:bg-gray-50 transition duration-150 ease-in-out">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                            <div className="mb-3 sm:mb-0">
                              <h3 className="font-semibold text-lg text-gray-800">Order #{order.orderId || order.id}</h3>
                              <p className="text-sm text-gray-500 mt-1">Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-xl text-gray-900">${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</p>
                              <div className="flex items-center justify-end text-sm text-gray-600 mt-1">
                                {getStatusIcon(order.status)}
                                <span className="capitalize">{order.status || 'Pending'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 mb-4">
                            {order.products?.map((productItem) => (
                              <div key={productItem.product?._id || productItem.id} className="flex items-center py-2 border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                                  <Image
                                    src={getProductImageUrl(productItem.product?.image || productItem.image)}
                                    alt={productItem.product?.name || productItem.name || 'Product Image'}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <p className="font-medium text-gray-800">{productItem.product?.name || productItem.name || 'Product Name'}</p>
                                  <p className="text-sm text-gray-500 mt-1">Qty: {productItem.quantity}</p>
                                </div>
                                <div className="ml-auto">
                                  <p className="text-base font-semibold text-gray-700">${productItem.price ? productItem.price.toFixed(2) : '0.00'}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Link
                              href={`/orders/${order._id || order.id}`}
                              className="text-base font-semibold text-[#E30B5D] hover:text-[#c5094f] flex items-center transition-colors duration-200"
                            >
                              View Details <FiChevronRight className="ml-1 text-lg" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <section className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <header className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Saved Addresses</h2>
                    <button className="text-base font-semibold text-[#E30B5D] hover:text-[#c5094f] flex items-center transition-colors duration-200">
                      <FiPlus className="mr-1" /> Add New Address
                    </button>
                  </header>
                  {addresses.length === 0 ? (
                    <div className="p-8 text-center bg-white">
                      <FiMapPin className="mx-auto text-gray-400 text-6xl mb-4" />
                      <p className="text-gray-500 mb-6 text-lg">You haven't saved any addresses yet.</p>
                      <button className="inline-flex items-center bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-3 rounded-lg text-base font-semibold transition duration-300 ease-in-out transform hover:scale-105">
                        <FiPlus className="mr-2" /> Add First Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white">
                      {addresses.map((address) => (
                        <div key={address._id || address.id} className="border border-gray-200 rounded-lg p-6 relative bg-white hover:shadow-md transition-shadow duration-200">
                          {address.isDefault && (
                            <span className="absolute top-4 right-4 bg-[#E30B5D] text-white text-xs px-3 py-1 rounded-full font-medium">
                              Default
                            </span>
                          )}
                          <h3 className="font-semibold text-lg text-gray-800 mb-2">{address.type || 'Address'}</h3>
                          <p className="text-gray-600">{address.line1}</p>
                          {address.line2 && <p className="text-gray-600">{address.line2}</p>}
                          <p className="text-gray-600">{address.city}, {address.state} {address.zip}</p>
                          <p className="text-gray-600">{address.country}</p>
                          <div className="mt-6 flex space-x-4">
                            <button className="text-sm font-semibold text-[#E30B5D] hover:text-[#c5094f] flex items-center transition-colors duration-200">
                              <FiEdit className="mr-1" /> Edit
                            </button>
                            {!address.isDefault && (
                              <button className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors duration-200">
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <section className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <header className="p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-2xl font-bold text-gray-800">Account Details</h2>
                  </header>
                  <div className="p-6 bg-white">
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          id="fullName"
                          type="text"
                          value={authUser.name || ''}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200 bg-gray-50 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          id="emailAddress"
                          type="email"
                          value={authUser.email || ''}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200 bg-gray-50 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          id="phoneNumber"
                          type="tel"
                          value={authUser.phone || 'N/A'}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200 bg-gray-50 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                      <div className="pt-4">
                        <button className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg text-base font-semibold cursor-not-allowed opacity-70">
                          Save Changes (Coming Soon)
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
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