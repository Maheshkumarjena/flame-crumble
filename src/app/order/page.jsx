"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCreditCard, FiDollarSign, FiLock, FiCheck, FiTruck } from 'react-icons/fi';
import axios from 'axios';

const OrderPage = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await axios.get('/api/cart', { withCredentials: true });
        setCart(data.items);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create order on your server
      const { data } = await axios.post(
        '/api/orders',
        { paymentMethod: 'razorpay', amount: total },
        { withCredentials: true }
      );

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Your Company Name",
        description: "Order Payment",
        image: "/logo.png", // Your company logo
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          // Verify payment on server
          try {
            const verificationResponse = await axios.post('/api/payments/verify', {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              orderId: data.order._id
            }, { withCredentials: true });

            setOrderDetails(verificationResponse.data.order);
            setOrderSuccess(true);
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: data.user.name,
          email: data.user.email,
          contact: data.user.phone || ''
        },
        notes: {
          address: data.shippingAddress,
          orderId: data.order._id
        },
        theme: {
          color: '#E30B5D'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else if (paymentMethod === 'cod') {
      setLoading(true);
      try {
        const { data } = await axios.post(
          '/api/orders',
          { paymentMethod: 'cod' },
          { withCredentials: true }
        );
        setOrderDetails(data);
        setOrderSuccess(true);
      } catch (error) {
        console.error('Order failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (orderSuccess) {
    return (
      <OrderSuccess order={orderDetails} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center border-b pb-4">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden mr-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="razorpay"
                  name="payment"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="h-4 w-4 text-[#E30B5D] focus:ring-[#E30B5D]"
                />
                <label htmlFor="razorpay" className="flex items-center">
                  <FiCreditCard className="mr-2" />
                  UPI/Cards/Net Banking
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="h-4 w-4 text-[#E30B5D] focus:ring-[#E30B5D]"
                />
                <label htmlFor="cod" className="flex items-center">
                  <FiTruck className="mr-2" />
                  Cash on Delivery
                </label>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-[#E30B5D] hover:bg-[#c5094f] text-white py-3 rounded-lg font-medium flex items-center justify-center"
              >
                {loading ? 'Processing...' : 'Place Order'}
                {!loading && <FiLock className="ml-2" />}
              </button>

              <div className="flex items-center justify-center mt-4">
                <img 
                  src="/razorpay-logo.png" 
                  alt="Razorpay Secure Payments" 
                  className="h-8 opacity-70"
                />
                <span className="ml-2 text-xs text-gray-500">Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderSuccess = ({ order }) => {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden text-center p-8">
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FiCheck className="text-green-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-6">Thank you for your purchase</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="font-medium">Order #{order._id}</p>
          <p className="text-gray-600">Total: ₹{order.total.toFixed(2)}</p>
          <p className="text-gray-600">Payment Method: {order.paymentMethod}</p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/orders')}
            className="flex-1 bg-[#E30B5D] hover:bg-[#c5094f] text-white py-2 rounded-lg"
          >
            View Order
          </button>
          <button
            onClick={() => router.push('/shop')}
            className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;