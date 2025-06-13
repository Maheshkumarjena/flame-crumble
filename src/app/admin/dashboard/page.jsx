'use client';
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import useAdminAuth from '@/hooks/useAdminAuth';
import AdminLayout from '@/components/Dashboard/AdminLayout';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, isAdmin } = useAdminAuth();

  useEffect(() => {
    // Handle redirection if not authenticated or not admin
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/auth/login?returnUrl=${encodeURIComponent('/admin/dashboard')}`);
      } else if (!isAdmin) {
        router.push('/access-denied');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    // Only show warning when there are potential unsaved changes
    const handleBeforeUnload = (e) => {
      const hasUnsavedChanges = false; // Add your actual unsaved changes logic here
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E30B5D]" />
        <p className="ml-4 text-gray-700">Loading admin dashboard...</p>
      </main>
    );
  }

  // Don't render anything if not authenticated or not admin
  // (redirection is handled in useEffect)
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

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