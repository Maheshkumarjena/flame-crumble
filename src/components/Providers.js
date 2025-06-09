// components/Providers.jsx
'use client'; // This component must be a Client Component

import { Provider } from 'react-redux';
import { makeStore } from '@/lib/store';
import { useRef, useEffect } from 'react';
import { checkAuthStatus } from '@/lib/features/auth/authSlice'; // Import the thunk

export function Providers({ children }) {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    // Create the store instance once when the component mounts
    storeRef.current = makeStore();
  }

  // Use useEffect to dispatch checkAuthStatus after the component mounts.
  // This ensures Redux Thunk middleware is fully operational.
  useEffect(() => {
    if (storeRef.current) {
      storeRef.current.dispatch(checkAuthStatus());
    }
  }, []); // Empty dependency array means this effect runs only once on mount

  // Optional: Re-dispatch checkAuthStatus on browser focus for session freshness
  useEffect(() => {
    const handleFocus = () => {
      if (storeRef.current) {
        storeRef.current.dispatch(checkAuthStatus());
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return <Provider store={storeRef.current}>{children}</Provider>;
}
