// hooks/useAdminAuth.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthStatus } from '@/lib/features/auth/authSlice';
import { selectIsAuthenticated, selectIsAdmin, selectAuthLoading } from '@/lib/features/auth/selector';

export default function useAdminAuth() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const authLoading = useSelector(selectAuthLoading);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await dispatch(checkAuthStatus()).unwrap();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push(`/auth/login?returnUrl=${encodeURIComponent('/admin/dashboard')}`);
      } finally {
        setAuthChecked(true);
      }
    };

    if (!authChecked && !authLoading) {
      verifyAuth();
    }
  }, [dispatch, router, authChecked, authLoading]);

  useEffect(() => {
    if (authChecked && !authLoading && !isAdmin) {
      router.push('/access-denied');
    }
  }, [authChecked, authLoading, isAdmin, router]);

  return {
    isAuthenticated,
    isAdmin,
    isLoading: !authChecked || authLoading
  };
}