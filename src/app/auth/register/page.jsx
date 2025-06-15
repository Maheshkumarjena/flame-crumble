'use client';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import Button from '@/components/UI/Button';
import axios from 'axios'; // Import axios
import { FcGoogle } from 'react-icons/fc'; // Import Google icon

// Get the backend URL from environment variables
// In Next.js, public environment variables must be prefixed with NEXT_PUBLIC_
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors

    try {
      // Using axios for the POST request
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        name,
        email,
        password,
      }, {
        // Axios handles content-type for JSON automatically with object body
        withCredentials: true, // Important for sending/receiving cookies across domains
      });

      // If the request is successful, axios throws an error for non-2xx status codes
      // So, if we reach here, it means the request was successful (2xx status)

      // If registration is successful, redirect to the verify-email page
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      // Axios errors are typically in err.response for HTTP errors
      if (err.response) {
        const { data, status } = err.response;
        // Handle validation errors from express-validator
        if (status === 400 && data.errors && Array.isArray(data.errors)) {
          // Join multiple validation error messages into a single string
          const validationErrors = data.errors.map(valErr => valErr.msg).join('; ');
          setError(validationErrors);
        } else {
          // Handle other backend errors (e.g., 409 Conflict, 500 Internal Server Error)
          setError(data.error || 'Registration failed due to an unexpected error.');
        }
      } else if (err.request) {
        // The request was made but no response was received (e.g., network error)
        setError('No response from server. Please check your network connection or backend URL.');
      } else {
        // Something else happened while setting up the request
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false); // Ensure loading is set to false in all cases
    }
  };

  return (
    <>
      <Head>
        <title>Register | flame&crumble</title>
        <meta name="description" content="Create a new account" />
      </Head>

      <Navbar />

      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-black text-white p-6">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-gray-300">Join flame&crumble today</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E30B5D] focus:border-[#E30B5D]"
                    required
                  />
                </div>
              </div>

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
                    minLength="6"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-[#E30B5D] focus:ring-[#E30B5D] border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#E30B5D] hover:text-[#c5094f]">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#E30B5D] hover:text-[#c5094f]">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
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
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="mt-6"> {/* Adjusted to a single column for the Google button */}
                {/* Google Sign-up Button */}
                <Button
                  variant="secondary"
                  className="w-full flex justify-center items-center"
                >
                  <FcGoogle className="w-5 h-5 mr-2" />
                  Sign up with Google
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-[#E30B5D] hover:text-[#c5094f]">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}