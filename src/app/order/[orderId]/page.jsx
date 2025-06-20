'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuthLoading, selectAuthUser } from '@/lib/features/auth/selector';
import axios from 'axios';
import Link from 'next/link';

// Re-using the MessageBox component
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

export default function OrderDetailPage() {
  const router = useRouter();
  const { orderId, paymentSuccess } = router.query;
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);
  const authUser = useSelector(selectAuthUser); // To check if user is admin

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(`/order/${orderId}`)}`);
    }

    if (orderId && isAuthenticated) {
      const fetchOrder = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`${BACKEND_URL}/api/orders/${orderId}`, {
            withCredentials: true,
          });
          setOrder(response.data);
          if (paymentSuccess === 'true') {
            setSuccessMessage('Payment completed successfully!');
          }
        } catch (err) {
          console.error('Error fetching order details:', err);
          setError(err.response?.data?.error || 'Failed to load order details.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [authLoading, isAuthenticated, router, orderId, paymentSuccess]);

  if (authLoading || !isAuthenticated || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
        <p className="ml-4 text-gray-700">Loading order details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 px-4 lg:px-8 font-sans flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-6 lg:p-8 text-center">
          <MessageBox type="error" message={error} onClose={() => setError(null)} />
          <p className="mt-4 text-gray-700">We could not find the order or you don't have permission to view it.</p>
          <button
            onClick={() => router.push('/myorders')}
            className="mt-6 bg-[#E30B5D] hover:bg-[#c5094f] text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Back to My Orders
          </button>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 px-4 lg:px-8 font-sans flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-6 lg:p-8 text-center">
          <p className="text-gray-700">Order not found.</p>
        </div>
      </main>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 font-semibold';
      case 'shipped': return 'text-blue-600 font-semibold';
      case 'processing': return 'text-purple-600 font-semibold';
      case 'pending': return 'text-yellow-600 font-semibold';
      case 'cancelled': return 'text-red-600 font-semibold';
      default: return 'text-gray-600';
    }
  };

  const getProductImageUrl = (imagePath) => {
    const placeholder = "https://placehold.co/80x80/e0e0e0/555555?text=No+Image";
    return imagePath 
      ? (imagePath.startsWith('/') ? imagePath : `/images/${imagePath}`)
      : placeholder;
  };

  return (
    <>
      <Head>
        <title>Order #{order._id.slice(-6).toUpperCase()} | flame&crumble</title>
      </Head>
      <main className="min-h-screen bg-gray-100 py-12 px-4 lg:px-8 font-sans">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6 lg:p-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">Order Details</h1>
          <p className="text-xl text-gray-600 mb-8 text-center">Order ID: <span className="font-bold">{order._id}</span></p>

          {successMessage && <MessageBox type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}
          {error && <MessageBox type="error" message={error} onClose={() => setError(null)} />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Information</h2>
                <div className="text-gray-700 space-y-2">
                  <p><strong>Status:</strong> <span className={`capitalize ${getStatusColor(order.status)}`}>{order.status}</span></p>
                  <p><strong>Ordered By:</strong> {order.user?.name || 'N/A'} ({order.user?.email || 'N/A'})</p>
                  <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                  <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                  <p>
                    <strong>Payment Status:</strong>{' '}
                    <span className={order.isPaid ? 'text-green-600' : 'text-red-600'}>
                      {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Not Paid'}
                    </span>
                  </p>
                  {order.razorpayPaymentId && (
                    <p><strong>Payment ID:</strong> {order.razorpayPaymentId}</p>
                  )}
                  <p>
                    <strong>Delivery Status:</strong>{' '}
                    <span className={order.isDelivered ? 'text-green-600' : 'text-yellow-600'}>
                      {order.isDelivered ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}` : 'Not Delivered'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Address</h2>
                <address className="text-gray-700 not-italic space-y-1">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                </address>
              </div>

              {/* Order Items */}
              <div className="bg-white p-6 rounded-lg shadow-inner border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.product._id || item.product} className="flex items-center space-x-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                        <img
                          src={getProductImageUrl(item.image)}
                          alt={item.name}
                          className="object-cover w-full h-full"
                          onError={(e) => e.target.src = getProductImageUrl(null)} // Fallback
                        />
                      </div>
                      <div className="flex-grow">
                        <Link href={`/products/${item.product._id || item.product}`} className="text-lg font-semibold text-gray-800 hover:text-[#E30B5D]">
                          {item.name}
                        </Link>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-gray-600">Price: ₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-100 h-fit">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-gray-700">
                  <span>Items Total</span>
                  <span className="font-semibold">₹{(order.totalAmount - order.shippingPrice - order.taxPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold">₹{order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Tax</span>
                  <span className="font-semibold">₹{order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-xl font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {!order.isPaid && (
                <button
                  onClick={() => router.push(`/payment/${order._id}`)}
                  className="w-full bg-[#E30B5D] hover:bg-[#c5094f] text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                >
                  Proceed to Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
