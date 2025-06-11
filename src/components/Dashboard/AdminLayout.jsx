'use client';
import { useState, useEffect } from 'react'; // Import useEffect
import Link from 'next/link';
import { FiHome, FiBox, FiShoppingCart, FiUsers, FiSettings, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { logoutUser } from '@/lib/features/auth/authSlice'; // Import logout thunk
import { useRouter } from 'next/navigation';

// Import individual admin section components
import DashboardOverview from './DashboardOverview';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import UserManagement from './UserManagement';

const AdminLayout = () => {
  // Initialize activeSection from localStorage, default to 'overview'
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== 'undefined') { // Check if window is defined (client-side)
      const savedSection = localStorage.getItem('adminActiveSection');
      return savedSection || 'overview';
    }
    return 'overview'; // Default for SSR
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  const dispatch = useDispatch();
  const router = useRouter();

  // Effect to save activeSection to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure localStorage is available
      localStorage.setItem('adminActiveSection', activeSection);
    }
  }, [activeSection]); // Dependency array: run when activeSection changes

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/auth/login'); // Redirect to login after logout
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'users':
        return <UserManagement />;
      case 'settings': // Placeholder for future settings
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>
            <p className="text-gray-600">Site-wide settings will be managed here.</p>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white rounded-md shadow-md text-gray-700"
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-black text-white p-6 
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Title */}
          <Link href="/" className="text-2xl font-bold text-white mb-8">
            flame&crumble Admin
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <button
              onClick={() => { setActiveSection('overview'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-lg transition-colors duration-200 
                ${activeSection === 'overview' ? 'bg-[#E30B5D] text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            >
              <FiHome className="mr-3" size={20} /> Dashboard
            </button>
            <button
              onClick={() => { setActiveSection('products'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-lg transition-colors duration-200 
                ${activeSection === 'products' ? 'bg-[#E30B5D] text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            >
              <FiBox className="mr-3" size={20} /> Products
            </button>
            <button
              onClick={() => { setActiveSection('orders'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-lg transition-colors duration-200 
                ${activeSection === 'orders' ? 'bg-[#E30B5D] text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            >
              <FiShoppingCart className="mr-3" size={20} /> Orders
            </button>
            <button
              onClick={() => { setActiveSection('users'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-lg transition-colors duration-200 
                ${activeSection === 'users' ? 'bg-[#E30B5D] text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            >
              <FiUsers className="mr-3" size={20} /> Users
            </button>
            {/* <button
              onClick={() => { setActiveSection('settings'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-lg transition-colors duration-200 
                ${activeSection === 'settings' ? 'bg-[#E30B5D] text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            >
              <FiSettings className="mr-3" size={20} /> Settings
            </button> */}
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors duration-200"
            >
              <FiLogOut className="mr-3" size={20} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default AdminLayout;
