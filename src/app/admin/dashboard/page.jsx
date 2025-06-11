'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectIsAdmin, selectAuthLoading } from '@/lib/features/auth/selector';
import { checkAuthStatus } from '@/lib/features/auth/authSlice'; // Import the auth check action
import AdminLayout from '@/components/Dashboard/AdminLayout';

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const authLoading = useSelector(selectAuthLoading);
  const [authChecked, setAuthChecked] = useState(false);

  console.log('AdminDashboardPage rendered>>>>>>>>>>',isAdmin);

  // Check authentication status on mount
  useEffect(() => {
    dispatch(checkAuthStatus()).finally(() => {
      setAuthChecked(true);
    });
  }, [dispatch]);

  // Effect to protect the route
  useEffect(() => {
    // Only run checks after auth status has been verified
    
    if (authChecked && !authLoading) {
      if (!isAuthenticated) {
        router.push(`/auth/login?returnUrl=${encodeURIComponent('/admin/dashboard')}`);
      } else if (!isAdmin) {
        router.push('/access-denied');
      }
    }
  }, [authChecked, authLoading, isAuthenticated, isAdmin, router]);

  // Show loading spinner while authentication status is being determined
  if (!authChecked || authLoading) {
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
      
      <AdminLayout />
    </>
  );
}