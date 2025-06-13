'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiShoppingCart, FiUsers, FiDollarSign, FiPackage, FiRefreshCw } from 'react-icons/fi';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    productsInStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/dashboard`, {
        withCredentials: true,
      });
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && !lastUpdated) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E30B5D]"></div>
        <p className="ml-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error && !lastUpdated) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-[#E30B5D] text-white rounded hover:bg-[#c5094f] flex items-center mx-auto"
        >
          <FiRefreshCw className="mr-2" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
        <div className="flex items-center">
          {lastUpdated && (
            <span className="text-sm text-gray-500 mr-3">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className={`p-2 rounded-full ${loading ? 'text-gray-400' : 'text-[#E30B5D] hover:bg-gray-100'}`}
            aria-label="Refresh data"
          >
            <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card: Total Orders */}
        <div className="bg-gradient-to-br from-[#E30B5D] to-[#c5094f] text-white p-6 rounded-lg shadow-lg flex items-center justify-between transition-transform transform hover:scale-105">
          <div>
            <div className="text-sm font-medium opacity-80 mb-1">Total Orders</div>
            <div className="text-4xl font-extrabold">{formatNumber(stats.totalOrders)}</div>
          </div>
          <FiShoppingCart size={48} className="opacity-30" />
        </div>

        {/* Stat Card: Total Revenue */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between transition-transform transform hover:scale-105">
          <div>
            <div className="text-sm font-medium opacity-80 mb-1">Total Revenue</div>
            <div className="text-4xl font-extrabold">{formatCurrency(stats.totalRevenue)}</div>
          </div>
          <FiDollarSign size={48} className="opacity-30" />
        </div>

        {/* Stat Card: Total Users */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between transition-transform transform hover:scale-105">
          <div>
            <div className="text-sm font-medium opacity-80 mb-1">Total Users</div>
            <div className="text-4xl font-extrabold">{formatNumber(stats.totalUsers)}</div>
          </div>
          <FiUsers size={48} className="opacity-30" />
        </div>

        {/* Stat Card: Products in Stock */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between transition-transform transform hover:scale-105">
          <div>
            <div className="text-sm font-medium opacity-80 mb-1">Products in Stock</div>
            <div className="text-4xl font-extrabold">{formatNumber(stats.productsInStock)}</div>
          </div>
          <FiPackage size={48} className="opacity-30" />
        </div>
      </div>

      {/* Recent activities */}
      <div className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <p className="text-gray-500">Coming soon: A feed of recent orders, new users, and product updates.</p>
      </div>
    </div>
  );
};

export default DashboardOverview;