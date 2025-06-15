// app/admin/dashboard/layout.jsx (or wherever your AdminLayout is located)
'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
// FiMenu is no longer needed here if it's inside AdminSidebar
// import { FiMenu } from 'react-icons/fi';

import DashboardOverview from './DashboardOverview';
import AdminSidebar from './ui/AdminSidebar';

const AdminLayout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('overview'); // activeSection still needed here to render the correct content
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isChangingRoute, setIsChangingRoute] = useState(false);

  // Set active section for content rendering based on pathname
  useEffect(() => {
    const pathSegments = pathname.split('/');
    const section = pathSegments[pathSegments.length - 1];
    if (['overview', 'products', 'orders', 'users'].includes(section)) {
      setActiveSection(section);
    } else {
      setActiveSection('overview'); // Default
    }
  }, [pathname]);

  // Route change loading indicator (remains the same)
  useEffect(() => {
    if (!router || !router.events) return;

    const handleRouteChange = () => setIsChangingRoute(true);
    const handleRouteComplete = () => setIsChangingRoute(false);

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteComplete);
    };
  }, [router]);

  // Render the active section (remains the same)
  const renderActiveSection = useCallback(() => {
    switch (activeSection) {
      case 'overview': return <DashboardOverview />;
      
      default: return <DashboardOverview />;
    }
  }, [activeSection]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Route change loading bar */}
      {isChangingRoute && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-[#E30B5D] z-150">
          <div className="h-full bg-[#c5094f] animate-progress" />
        </div>
      )}

      {/* AdminSidebar Component - only pass mobile state */}
      <AdminSidebar
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <main
        className="flex-1 overflow-y-auto p-4 lg:p-8"
        // Close mobile sidebar if clicking outside of it
        onClick={() => setMobileSidebarOpen(false)}
      >
        <h2 className="text-2xl font-bold  text-gray-800">
          <div className='flex flex-row'>

            <h2 className="text-3xl m-auto  font-bold  text-gray-800 mb-6">          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} 
</h2>
            </div>

        </h2>
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default AdminLayout;