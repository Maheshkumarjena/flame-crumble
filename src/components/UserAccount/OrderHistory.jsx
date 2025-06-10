// components/UserAccount/OrderHistory.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiCheckCircle, FiTruck, FiShoppingCart, FiPlus, FiChevronRight } from 'react-icons/fi';

const OrderHistory = ({ orders, BACKEND_URL, displayLocalMessage }) => {

  // Gets appropriate icon based on order status
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

  // Determines the product image URL, with a fallback
  const getProductImageUrl = (imagePath) => {
    const placeholder = "https://placehold.co/64x64/e0e0e0/555555?text=No+Image";
    return imagePath
      ? (imagePath.startsWith('/') ? imagePath : `/images/${imagePath}`)
      : placeholder;
  };

  return (
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
  );
};

export default OrderHistory;
