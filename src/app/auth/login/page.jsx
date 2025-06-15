'use client';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import Button from '@/components/UI/Button';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import { loginUser } from '@/lib/features/auth/authSlice'; // Import the loginUser thunk
import { FcGoogle } from 'react-icons/fc'; // Import Google icon

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Get state from Redux store using useSelector
  // Access the 'error' object from the auth slice, and destructure its 'message' property
  const { loading, error: authErrorObject } = useSelector((state) => state.auth);
  const dispatch = useDispatch(); // Get the dispatch function to send actions to the store

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Dispatch the loginUser async thunk. This handles setting loading, error, and user state in Redux.
    const resultAction = await dispatch(loginUser({ email, password }));

    // Check if the loginUser thunk was fulfilled (successful)
    if (loginUser.fulfilled.match(resultAction)) {
      // If login is successful, redirect the user.
      // Use returnUrl from query params if available, otherwise default to '/account'.
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || '/account';
      router.push(returnUrl);
    } else {
      // If the thunk was rejected (login failed), the error state in Redux will be updated.
      // No need to set a local error state, as it's managed by Redux.
      // We can log the error for debugging.
      console.error('Login failed:', resultAction.payload || 'Unknown error during login.');
    }
  };

  // Access the message from the authErrorObject for display and checks
  const displayErrorMessage = authErrorObject?.message;

  // Check if the current error message from Redux state is specifically about unverified email
  // Now we check displayErrorMessage (which is the string)
  const isUnverifiedEmailError = displayErrorMessage?.includes('Your email is not verified') || displayErrorMessage?.includes('Please verify your email');

  return (
    <>
      <Head>
        <title>Login | flame&crumble</title>
        <meta name="description" content="Login to your account" />
      </Head>

      <Navbar />

      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-black text-white p-6">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-gray-300">Login to your account</p>
          </div>

          <div className="p-6">
            {/* Display error message from Redux state */}
            {/* Use displayErrorMessage for rendering */}
            {displayErrorMessage && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
                <p>{displayErrorMessage}</p>
                {isUnverifiedEmailError && (
                  <div className="mt-2 text-center">
                    <Link
                      href={`/auth/verify-email?email=${encodeURIComponent(email)}`}
                      className="font-medium text-[#E30B5D] hover:text-[#c5094f] underline"
                    >
                      Click here to verify your email
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E30B5D] focus:border-[#E30B5D]"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E30B5D] focus:border-[#E30B5D]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#E30B5D] focus:ring-[#E30B5D] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-[#E30B5D] hover:text-[#c5094f]">
                    Forgot password ?
                  </Link>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full flex justify-center items-center"
                  disabled={loading} // Button disabled when loading
                >
                  {loading ? (
                    <span className="animate-spin mr-2">↻</span> // Loading spinner
                  ) : (
                    <FiLogIn className="mr-2" />
                  )}
                  Sign In
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                {/* Google Login Button */}
                <Button
                  variant="secondary"
                  className="w-full flex justify-center items-center"
                >
                  <FcGoogle className="w-5 h-5 mr-2" />
                  Sign in with Google
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-medium text-[#E30B5D] hover:text-[#c5094f]">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}