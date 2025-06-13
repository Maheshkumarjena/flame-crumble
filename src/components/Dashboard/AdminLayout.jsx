'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FiHome, FiBox, FiShoppingCart, FiUsers, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { logoutUser } from '@/lib/features/auth/authSlice';
import DashboardOverview from './DashboardOverview';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import UserManagement from './UserManagement';

const AdminLayout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isChangingRoute, setIsChangingRoute] = useState(false);

  // Memoized navigation handler
  const handleNavigation = useCallback((section) => {
    setActiveSection(section);
    setMobileSidebarOpen(false);
    router.push(`/admin/dashboard/${section}`);
  }, [router]);

  // Set active section based on pathname
  useEffect(() => {
    const section = pathname.split('/').pop();
    if (['overview', 'products', 'orders', 'users'].includes(section)) {
      setActiveSection(section);
    }
  }, [pathname]);

  // Route change loading indicator
   useEffect(() => {
    // Check if router and router.events exists
    if (!router || !router.events) return;

    const handleRouteChange = () => setIsChangingRoute(true);
    const handleRouteComplete = () => setIsChangingRoute(false);

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteComplete);
    };
  }, [router]); // Only run when router changes

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

  // Render the active section
  const renderActiveSection = useCallback(() => {
    switch(activeSection) {
      case 'overview': return <DashboardOverview />;
      case 'products': return <ProductManagement />;
      case 'orders': return <OrderManagement />;
      case 'users': return <UserManagement />;
      default: return <DashboardOverview />;
    }
  }, [activeSection]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Route change loading bar - only shows for admin routes */}
      {isChangingRoute && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-[#E30B5D] z-50">
          <div className="h-full bg-[#c5094f] animate-progress" />
        </div>
      )}

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button 
          onClick={() => setMobileSidebarOpen(prev => !prev)}
          className="p-2 bg-white rounded-md shadow-md text-gray-700 focus:outline-none"
          aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-black text-white p-6 
        transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
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

      {/* Main Content Area */}
      <main 
        className="flex-1 overflow-y-auto p-4 lg:p-8"
        onClick={() => setMobileSidebarOpen(false)}
      >
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default AdminLayout;


