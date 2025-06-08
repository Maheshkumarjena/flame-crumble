// app/auth/verify-email/VerifyEmailClientComponent.jsx
'use client' // This component uses client-side hooks

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiMail, FiCode } from 'react-icons/fi';
import Button from '@/components/UI/Button';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function VerifyEmailClientComponent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This is the problematic hook
  const initialEmail = searchParams.get('email') || ''; // Accessing searchParams here

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/verify-email`, {
        email,
        code,
      });

      setSuccess(response.data.message);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      if (err.response) {
        const { data, status } = err.response;
        setError(data.error || 'Email verification failed.');
      } else if (err.request) {
        setError('No response from server. Please check your network connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/resend-verification`, {
        email,
      });
      setSuccess(response.data.message);
    } catch (err) {
      if (err.response) {
        const { data } = err.response;
        setError(data.error || 'Failed to resend code.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-black text-white p-6">
        <h1 className="text-2xl font-bold">Verify Your Email</h1>
        <p className="text-gray-300">Enter the code sent to your email address</p>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
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
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCode className="text-gray-400" />
              </div>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E30B5D] focus:border-[#E30B5D]"
                maxLength="6"
                required
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResendCode}
            className="text-[#E30B5D] hover:text-[#c5094f] text-sm"
            disabled={resending}
          >
            {resending ? 'Resending Code...' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}