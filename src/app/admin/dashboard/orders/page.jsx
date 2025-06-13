// components/Admin/OrderManagement.jsx
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FiEye, FiCheckCircle, FiTruck, FiClock } from 'react-icons/fi'; // Icons for order status

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'shipped', 'delivered'

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]); // Refetch when filter changes

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming /api/admin/orders is an admin-protected endpoint
      const response = await axios.get(`${BACKEND_URL}/api/admin/orders`, {
        params: { status: filterStatus === 'all' ? undefined : filterStatus }, // Send filter to backend
        withCredentials: true,
      });
      setOrders(response.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.error || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change order ${orderId} status to ${newStatus}?`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Assuming /api/admin/orders/:id/status is an admin-protected endpoint
      await axios.patch(`${BACKEND_URL}/api/admin/orders/${orderId}/status`, { status: newStatus }, {
        withCredentials: true,
      });
      fetchOrders(); // Refresh orders after update
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError(err.response?.data?.error || 'Failed to update order status.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <FiCheckCircle className="text-green-500" />;
      case 'shipped': return <FiTruck className="text-blue-500" />;
      case 'pending':
      default: return <FiClock className="text-yellow-500" />;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E30B5D]"></div>
        <p className="ml-4 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Order Management</h2>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-700">All Orders</h3>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#E30B5D]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId || order._id.slice(-6).toUpperCase()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user?.name || order.user || 'N/A'}</td> {/* Assuming user is populated or just userId */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize 
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/orders/${order._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <FiEye size={18} />
                  </Link>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
