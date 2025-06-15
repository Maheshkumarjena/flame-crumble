// components/Admin/AdminSidebar.jsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { FiHome, FiBox, FiShoppingCart, FiUsers, FiX, FiLogOut, FiMenu } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/features/auth/authSlice';

const AdminSidebar = ({ mobileSidebarOpen, setMobileSidebarOpen }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('overview');

  // Effect to set active section based on pathname
  useEffect(() => {
    // If the path is exactly /admin/dashboard, then 'overview' is active
    if (pathname === '/admin/dashboard' || pathname === '/admin/dashboard/') {
      setActiveSection('overview');
    } else {
      const pathSegments = pathname.split('/');
      // Get the last segment
      const section = pathSegments[pathSegments.length - 1];
      if (['products', 'orders', 'users'].includes(section)) {
        setActiveSection(section);
      } else {
        // Default to 'overview' if path doesn't match a known section,
        // this covers cases like '/admin/dashboard' without a trailing section
        setActiveSection('overview');
      }
    }
  }, [pathname]);

  // Internal navigation handler for the sidebar
  const handleNavigation = useCallback((section) => {
    // Special handling for the 'overview' section
    if (section === 'overview') {
      router.push('/admin/dashboard'); // Navigate to the base admin dashboard path
    } else {
      router.push(`/admin/dashboard/${section}`); // Navigate to specific section
    }
    setMobileSidebarOpen(false); // Close sidebar on navigation (for mobile)
  }, [router, setMobileSidebarOpen]);

  // Handle logout with error handling
  const handleLogout = useCallback(async (e) => {
    e?.preventDefault();
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show error toast/notification
    }
  }, [dispatch, router]);

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-140">
        <button
          onClick={() => setMobileSidebarOpen(prev => !prev)}
          className="p-2 bg-white rounded-md shadow-md text-rose-500 focus:outline-none"
          aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {mobileSidebarOpen ? <FiX size={17} /> : <FiMenu size={17} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`absolute inset-y-0 left-0 z-150 w-64 bg-black text-white p-6
        transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile - visible only when sidebar is open */}
          {mobileSidebarOpen && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden bg-gray-100 rounded-lg absolute top-6 right-4 p-2 text-rose-400 hover:text-white focus:outline-none"
              aria-label="Close sidebar"
            >
              <FiX size={17} />
            </button>
          )}

          <h1 className="text-2xl font-bold text-white mb-8">flame&crumble Admin</h1>

          <nav className="flex-1 space-y-2">
            {['overview', 'products', 'orders', 'users'].map((section) => (
              <button
                key={section}
                onClick={() => handleNavigation(section)}
                className={`w-full text-left flex items-center px-4 py-3 rounded-lg text-lg transition-colors duration-200
                  ${activeSection === section ? 'bg-[#E30B5D] text-white' : 'hover:bg-gray-800 text-gray-300'}`}
                type="button"
              >
                {{
                  overview: <><FiHome className="mr-3" size={20} /> Dashboard</>,
                  products: <><FiBox className="mr-3" size={20} /> Products</>,
                  orders: <><FiShoppingCart className="mr-3" size={20} /> Orders</>,
                  users: <><FiUsers className="mr-3" size={20} /> Users</>,
                }[section]}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors duration-200 focus:outline-none"
              type="button"
              aria-label="Logout"
            >
              <FiLogOut className="mr-3" size={20} /> Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;