"use client";
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';

export default function UserAccount() {
  // In a real app, this would come from context or API
  const user = {
    name: 'Jessica Anderson',
    email: 'jessica.anderson@example.com',
    phone: '(555) 123-4567',
    address: {
      type: 'Home',
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
    },
    orders: [
      {
        id: '#FL29845',
        date: 'March 15, 2025',
        amount: 124.95,
        items: 3,
        status: 'Delivered',
      },
      {
        id: '#FL28736',
        date: 'February 22, 2025',
        amount: 78.50,
        items: 2,
        status: 'Delivered',
      },
      {
        id: '#FL27459',
        date: 'January 10, 2025',
        amount: 215.00,
        items: 4,
        status: 'Delivered',
      },
    ],
  };

  return (
    <>
      <Head>
        <title>My Account | flame&crumble</title>
        <meta name="description" content="Your account dashboard" />
      </Head>
      
      
      <main className="min-h-screen py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className='absolute opacity-100 z-100 inset-0'>
                <Navbar />

          </div>
        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-gray-600 mb-8">Welcome back, {user.name.split(' ')[0]}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Addresses</h2>
              <div>
                <p className="font-medium">{user.address.type}</p>
                <p>{user.address.line1}</p>
                <p>{user.address.line2}</p>
                <p>{user.address.city}, {user.address.state} {user.address.zip}</p>
                <p>{user.address.country}</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              <div className="space-y-4">
                {user.orders.map((order) => (
                  <div key={order.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{order.items} Items</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                      <Link 
                        href={`/orders/${order.id}`} 
                        className="text-sm text-[#E30B5D] hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
                <Link 
                  href="/orders" 
                  className="inline-block text-[#E30B5D] hover:underline mt-2"
                >
                  View All Orders &gt;
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Wishlist</h2>
              <p className="text-gray-500">Your wishlist is empty</p>
              <Link 
                href="/shop" 
                className="inline-block mt-4 bg-[#E30B5D] hover:bg-[#c5094f] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      {/* <Footer /> */}
    </>
  );
}