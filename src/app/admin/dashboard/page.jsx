'use client';
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux'; // Redux hooks
import { selectIsAuthenticated, selectIsAdmin, selectAuthLoading } from '@/lib/features/auth/selector'; // Auth selectors
import AdminLayout from '@/components/Dashboard/AdminLayout';
import { useCallback } from 'react';

export default function AdminDashboardPage() {
  const router = useRouter();
  // const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin).user?.role === 'admin' || false; // Check if the user is an admin
  const authLoading = useSelector(selectAuthLoading);

  console.log("isAdmin:::::::::::::::::::", isAdmin.user);
  // const isAuthenticated = isAdmin?.user?.role === 'admin' || false; // Check if the user is authenticated and an admin

  const isAuthenticated = useCallback(async () => {
    try {
      // This endpoint should return 200 if authenticated, 401/403 otherwise.
      const response = await axios.get(`${BACKEND_URL}/api/auth/status`, {
        withCredentials: true,
      });
      // If the response is successful, it means the user is logged in
      return response.data.loggedIn;
    } catch (err) {
      console.error("Session check failed:", err);
      // If session check fails (e.g., token expired, network error), consider user as not logged in
      return false;
    }
  }, []);

  // console.log("isAuthenticated:::::::::::::::::::", isAuthenticated);









  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true); // Start loading for the entire page

      const isLoggedIn = await checkSessionAuth(); // Perform the explicit session check

      if (!authLoading) {
        if (!isLoggedIn) {
          // Not authenticated, redirect to login
          router.push(`/auth/login?returnUrl=${encodeURIComponent('/admin/dashboard')}`);
        } else if (!isAdmin) {
          // Authenticated but not an admin, redirect to homepage or access denied page
          router.push('/access-denied'); // You might want to create an access-denied page
        }
      }
    };

    initializePage();
  }, [authLoading, isAuthenticated, isAdmin, router]); // Dependencies updated



  // Effect to protect the route

  // Show loading spinner while authentication status is being determined
  if (authLoading || (!isAuthenticated && !authLoading) || (!isAdmin && !authLoading)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]"></div>
        <p className="ml-4 text-gray-700">Loading admin dashboard...</p>
      </main>
    );
  }

  // If we reach here, it means the user is authenticated and is an admin
  return (
    <>
      <Head>
        <title>Admin Dashboard | flame&crumble</title>
        <meta name="description" content="Manage your e-commerce business" />
      </Head>

      <AdminLayout /> {/* Render the AdminLayout component */}
    </>
  );
}
