'use client';
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectAuthUser, selectIsAuthenticated, selectAuthLoading } from '@/lib/features/auth/selector';
import axios from 'axios';

// Re-using common UI components (assuming you have these or similar)
// For now, I'll define a basic MessageBox here. In a real app, you'd import it.
const MessageBox = ({ type, message, onClose }) => {
  if (!message) return null;
  const baseClasses = "p-4 mb-4 rounded-md flex items-center shadow-sm";
  let typeClasses = "";
  switch (type) {
    case 'success': typeClasses = "bg-green-100 border-l-4 border-green-500 text-green-700"; break;
    case 'error': typeClasses = "bg-red-100 border-l-4 border-red-500 text-red-700"; break;
    default: typeClasses = "bg-blue-100 border-l-4 border-blue-500 text-blue-700"; break;
  }
  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      {/* Assuming you have these FiX, FiCheckCircle, FiAlertCircle icons available or similar SVGs */}
      {/* <FiCheckCircle className="mr-3 text-lg" /> */}
      <div className="flex-grow">
        <p className="font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-current hover:opacity-75">
          {/* <FiX size={18} /> */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      )}
    </div>
  );
};


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function CheckoutPage() {
  const router = useRouter();
  const authUser = useSelector(selectAuthUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'India', // Default or fetch from user profile
  });

  const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // Default to Razorpay
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Placeholder for cart items and totals. In a real app, these would come from your cart state.
  // Example: useSelector(selectCartItems) and useSelector(selectCartTotal)
  const [cartItems, setCartItems] = useState([
    { product: '60d0fe4f53112361681729c1', name: 'Vanilla Dream Candle', image: '/images/candle.jpg', quantity: 1, price: 29.99 },
    { product: '60d0fe4f53112361681729c2', name: 'Artisan Soap Bar', image: '/images/soap.jpg', quantity: 2, price: 10.00 },
  ]);
  const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const shippingPrice = 5.00; // Example fixed shipping
  const taxRate = 0.05; // 5% tax example
  const taxPrice = subtotal * taxRate;
  const totalAmount = subtotal + shippingPrice + taxPrice;

  // Protect the route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent('/checkout')}`);
    }
    // Pre-fill shipping address if user has existing addresses (fetch from backend later)
    // For now, if authUser has a phone, use it. You'd fetch full addresses here.
    if (authUser) {
      setShippingAddress(prev => ({
        ...prev,
        // You would typically fetch and populate the user's default address here
        phone: authUser.phone || '',
      }));
    }
  }, [authLoading, isAuthenticated, router, authUser]);

  const validateForm = () => {
    const errors = {};
    if (!shippingAddress.fullName) errors.fullName = 'Full Name is required.';
    if (!shippingAddress.phone) errors.phone = 'Phone Number is required.';
    if (!/^\d{10}$/.test(shippingAddress.phone)) errors.phone = 'Invalid phone number (10 digits required).';
    if (!shippingAddress.line1) errors.line1 = 'Address Line 1 is required.';
    if (!shippingAddress.city) errors.city = 'City is required.';
    if (!shippingAddress.state) errors.state = 'State is required.';
    if (!shippingAddress.zip) errors.zip = 'Zip Code is required.';
    if (!/^\d{6}$/.test(shippingAddress.zip)) errors.zip = 'Invalid zip code (6 digits required).';
    if (!shippingAddress.country) errors.country = 'Country is required.';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    setError(null);
    setSuccess(null);
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod,
        shippingPrice,
        taxPrice,
        totalAmount,
      };

      const response = await axios.post(`${BACKEND_URL}/api/orders`, orderData, {
        withCredentials: true,
      });

      setSuccess('Order created successfully! Redirecting to payment...');
      // Clear cart after successful order creation (if using Redux for cart)
      // dispatch(clearCart()); 
      router.push(`/payment/${response.data._id}`); // Redirect to payment page with order ID

    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.error || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
        <p className="ml-4 text-gray-700">Loading checkout...</p>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout | flame&crumble</title>
      </Head>
      <main className="min-h-screen bg-gray-100 py-12 px-4 lg:px-8 font-sans">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-xl p-6 lg:p-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Checkout</h1>

          {error && <MessageBox type="error" message={error} onClose={() => setError(null)} />}
          {success && <MessageBox type="success" message={success} onClose={() => setSuccess(null)} />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Address Section */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Shipping Address</h2>
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
                    required
                  />
                  {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
                    required
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="line1" className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    id="line1"
                    name="line1"
                    value={shippingAddress.line1}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
                    required
                  />
                  {formErrors.line1 && <p className="text-red-500 text-sm mt-1">{formErrors.line1}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="line2" className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    id="line2"
                    name="line2"
                    value={shippingAddress.line2}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
                    required
                  />
                  {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
                    required
                  />
                  {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={shippingAddress.zip}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
                    required
                  />
                  {formErrors.zip && <p className="text-red-500 text-sm mt-1">{formErrors.zip}</p>}
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
                    required
                    readOnly // If country is fixed
                  />
                  {formErrors.country && <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>}
                </div>
              </form>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-gray-700">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold">₹{shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Tax ({taxRate * 100}%)</span>
                  <span className="font-semibold">₹{taxPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Payment Method</h3>
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="razorpay"
                    name="paymentMethod"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="h-4 w-4 text-[#E30B5D] focus:ring-[#E30B5D] border-gray-300"
                  />
                  <label htmlFor="razorpay" className="ml-2 block text-base text-gray-900 font-medium">Razorpay</label>
                </div>
                {/* You can add more payment options here (e.g., Cash on Delivery) */}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-[#E30B5D] hover:bg-[#c5094f] text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Placing Order...
                  </>
                ) : (
                  'Place Order & Pay'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
