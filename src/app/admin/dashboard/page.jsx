"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../../../components/Layout/Navbar';
import Footer from '../../../components/Layout/Footer';
import DashboardCard from '../../../components/Dashboard/DashboardCard';
import OrderTable from '../../../components/Dashboard/OrderTable';
import StockAlert from '../../../components/Dashboard/StockAlert';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    lowStock: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be API calls
    const fetchData = async () => {
      try {
        // Simulating API calls
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockStats = {
          totalProducts: 42,
          totalOrders: 124,
          lowStock: 7,
        };
        
        const mockOrders = [
          {
            id: '#ORD-2554',
            date: 'May 5, 2025',
            status: 'Completed',
            amount: 125.00,
          },
          {
            id: '#ORD-2553',
            date: 'May 5, 2025',
            status: 'Processing',
            amount: 89.50,
          },
          {
            id: '#ORD-2552',
            date: 'May 4, 2025',
            status: 'Completed',
            amount: 216.00,
          },
        ];
        
        const mockProducts = [
          {
            name: 'Sourdough Loaf',
            price: 8.50,
            stock: 42,
            status: 'Active',
          },
          {
            name: 'Cinnamon Roll',
            price: 4.25,
            stock: 5,
            status: 'Active',
          },
          {
            name: 'Chocolate Croissant',
            price: 3.75,
            stock: 18,
            status: 'Active',
          },
        ];
        
        const mockLowStock = [
          {
            name: 'Cinnamon Roll',
            stock: 5,
          },
          {
            name: 'Multigrain Bread',
            stock: 3,
          },
        ];
        
        setStats(mockStats);
        setRecentOrders(mockOrders);
        setProducts(mockProducts);
        setLowStockItems(mockLowStock);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Admin Dashboard | flame&crumble</title>
        <meta name="description" content="Admin dashboard" />
      </Head>
      
      <Navbar />
      
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin</h1>
        <p className="text-gray-600 mb-8">Here's what's happening today, May 6, 2025</p>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <DashboardCard 
                title="Total Orders" 
                value={stats.totalOrders} 
                color="bg-[#E30B5D]" 
              />
              <DashboardCard 
                title="Low Stock" 
                value={stats.lowStock} 
                color="bg-yellow-500" 
              />
              <DashboardCard 
                title="Total Products" 
                value={stats.totalProducts} 
                color="bg-black" 
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                <OrderTable orders={recentOrders} />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Products</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {product.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Low Stock Alert</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lowStockItems.map((item, index) => (
                  <StockAlert key={index} item={item} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      
      {/* <Footer /> */}
    </>
  );
}