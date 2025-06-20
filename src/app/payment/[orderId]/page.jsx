'use client';
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectAuthUser, selectIsAuthenticated, selectAuthLoading } from '@/lib/features/auth/selector';
import axios from 'axios';

// Re-using the MessageBox component from CheckoutPage
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

// Function to load Razorpay SDK dynamically
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentPage() {
  const router = useRouter();
  const { orderId } = router.query; // Get orderId from URL parameter
  const authUser = useSelector(selectAuthUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  // Protect the route and fetch order details
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(`/payment/${orderId}`)}`);
    }

    if (orderId && isAuthenticated && !order) {
      const fetchOrder = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`${BACKEND_URL}/api/orders/${orderId}`, {
            withCredentials: true,
          });
          setOrder(response.data);
        } catch (err) {
          console.error('Error fetching order details:', err);
          setError(err.response?.data?.error || 'Failed to load order details.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [authLoading, isAuthenticated, router, orderId, order]);


  // Handle Razorpay payment initiation
  const initiateRazorpayPayment = useCallback(async () => {
    if (!order || order.isPaid) {
      setError('Order not found or already paid.');
      return;
    }

    setRazorpayLoading(true);
    setError(null);

    // 1. Load Razorpay SDK
    const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      setError('Razorpay SDK failed to load. Are you offline?');
      setRazorpayLoading(false);
      return;
    }

    try {
      // 2. Create Razorpay order on backend
      const { data: razorpayData } = await axios.post(`${BACKEND_URL}/api/orders/${order._id}/razorpay-order`, {}, {
        withCredentials: true,
      });

      const options = {
        key: razorpayData.key_id, // Your Razorpay Key ID
        amount: razorpayData.amount, // Amount in paise
        currency: razorpayData.currency,
        name: 'flame&crumble', // Your business name
        description: `Payment for Order #${order._id.slice(-6).toUpperCase()}`,
        order_id: razorpayData.razorpayOrderId, // Razorpay Order ID from backend
        handler: async function (response) {
          // 3. Handle successful payment callback
          setRazorpayLoading(true); // Keep loading during verification
          try {
            const verificationResponse = await axios.post(`${BACKEND_URL}/api/orders/${order._id}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, {
              withCredentials: true,
            });

            if (verificationResponse.data.message === 'Payment verified successfully. Order updated.') {
              router.push(`/order/${order._id}?paymentSuccess=true`); // Redirect to order details
            } else {
              setError('Payment verification failed on server.');
            }
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setError(verifyErr.response?.data?.error || 'Failed to verify payment with server.');
          } finally {
            setRazorpayLoading(false);
          }
        },
        prefill: {
          name: authUser?.name || '',
          email: authUser?.email || '',
          contact: order.shippingAddress.phone || '', // Prefill user's phone
        },
        notes: {
          address: `${order.shippingAddress.line1}, ${order.shippingAddress.city}`,
        },
        theme: {
          color: '#E30B5D', // Your brand color
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error('Error initiating Razorpay order:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment.');
    } finally {
      setRazorpayLoading(false);
    }
  }, [order, authUser, router]); // Depend on order and authUser for prefill and ID

  // Automatically trigger payment if order is loaded and not paid
  useEffect(() => {
    if (order && !order.isPaid && !razorpayLoading) {
        initiateRazorpayPayment();
    }
  }, [order, initiateRazorpayPayment, razorpayLoading]);


  if (authLoading || !isAuthenticated || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
        <p className="ml-4 text-gray-700">Loading payment...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 px-4 lg:px-8 font-sans flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-6 lg:p-8 text-center">
          <MessageBox type="error" message={error} onClose={() => setError(null)} />
          <p className="mt-4 text-gray-700">There was an issue processing your payment. Please try again or contact support.</p>
          <button
            onClick={() => router.push('/cart')}
            className="mt-6 bg-[#E30B5D] hover:bg-[#c5094f] text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Back to Cart
          </button>
        </div>
      </main>
    );
  }

  if (order?.isPaid) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 px-4 lg:px-8 font-sans flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-6 lg:p-8 text-center">
          <MessageBox type="success" message="This order has already been paid successfully!" />
          <button
            onClick={() => router.push(`/order/${order._id}`)}
            className="mt-6 bg-[#E30B5D] hover:bg-[#c5094f] text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            View Order Details
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Payment | flame&crumble</title>
      </Head>
      <main className="min-h-screen bg-gray-100 py-12 px-4 lg:px-8 font-sans">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-6 lg:p-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Complete Your Payment</h1>
          <p className="text-xl text-gray-700 mb-8">
            Order Total: <span className="font-bold">₹{order?.totalAmount.toFixed(2)}</span>
          </p>
          <p className="text-gray-600 mb-6">
            Please click the button below to open the Razorpay payment gateway.
          </p>
          <button
            onClick={initiateRazorpayPayment}
            disabled={razorpayLoading || !order}
            className="w-full max-w-sm mx-auto bg-[#E30B5D] hover:bg-[#c5094f] text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {razorpayLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                Loading Payment Gateway...
              </>
            ) : (
              'Pay Now with Razorpay'
            )}
          </button>
          {error && <MessageBox type="error" message={error} onClose={() => setError(null)} />}
        </div>
      </main>
    </>
  );
}
