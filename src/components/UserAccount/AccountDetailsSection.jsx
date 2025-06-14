// components/UserAccount/AccountDetailsSection.jsx
import React, { useState, useEffect } from 'react';
import { FiEdit, FiSave } from 'react-icons/fi';
import axios from 'axios';
import { resetAuth } from '@/lib/features/auth/authSlice';

const AccountDetailsSection = ({ authUser, dispatch, BACKEND_URL, displayLocalMessage }) => {
  // console.log('Rendering AccountDetailsSection with authUser:', authUser); // Keep for debugging if needed

  const [isAccountEditing, setIsAccountEditing] = useState(false);
  // Initialize accountFormData directly from authUser prop.
  // This ensures the form's initial state is always in sync with Redux.
  const [accountFormData, setAccountFormData] = useState({
    name: authUser?.name || '',
    phone: authUser?.phone || '',
    email: authUser?.email || '' // Include email for completeness, but it will be read-only
  });
  // console.log("formData:", accountFormData); // Debugging line to check formData state

  // Use useEffect to update form data if authUser prop changes (e.g., after a successful save
  // in handleSaveAccountDetails, or when authUser is initially loaded in the parent).
  useEffect(() => {
    setAccountFormData({
      name: authUser?.name || '',
      phone: authUser?.phone || '',
      email: authUser?.email || '' // Always keep email in sync, even if read-only

    });
  }, [authUser?.name, authUser?.phone]); // Depend on specific properties to avoid unnecessary re-runs

  // Handles account details editing
  const handleEditAccountClick = () => {
    setIsAccountEditing(true);
    // Form data is already synced by the useEffect above when entering edit mode,
    // ensuring current Redux values are used.
  };

  const handleAccountFormChange = (e) => {
    const { name, value } = e.target;
    setAccountFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSaveAccountDetails = async () => {
    displayLocalMessage('', ''); // Clear any existing messages
    try {
      const payload = {
        name: accountFormData.name,
        phone: accountFormData.phone
      };

      // Backend endpoint for updating current user's profile: /api/users/me
      // This assumes your backend's 'protect' middleware identifies the user from the token.
      const response = await axios.put(`${BACKEND_URL}/api/auth/me/${authUser.id}`, payload, {
        withCredentials: true,
      });

      // Update Redux state with the new user details received from the backend response.
      // This is crucial to keep the global Redux state consistent and
      // will trigger the useEffect above to re-sync accountFormData.
      dispatch(resetAuth(response.data.user));

      setIsAccountEditing(false);
      displayLocalMessage('success', 'Account details updated successfully!');
    } catch (err) {
      console.error('Error updating account details:', err);
      displayLocalMessage('error', err.response?.data?.error || 'Failed to update account details.');
    }
  };

  const handleCancelAccountEdit = () => {
    setIsAccountEditing(false);
    // Reset form data to current authUser data from Redux state when cancelling.
    setAccountFormData({
      name: authUser?.name || '',
      phone: authUser?.phone || ''
    });
  };

  // If authUser is null, it means the parent component (pages/account.js)
  // is still loading or the user is not authenticated. In pages/account.js,
  // we already handle showing a loader or redirecting if authUser is null.
  // So, if we reach here, authUser should ideally be populated.
  // However, as a defensive measure, we can return a loader if authUser is unexpectedly null.
  // The primary loading state for auth should be handled in the parent.
  if (!authUser) {
    return (
      <section className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#E30B5D]"></div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <header className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Account Details</h2>
        {!isAccountEditing && (
          <button onClick={handleEditAccountClick} className="text-base font-semibold text-[#E30B5D] hover:text-[#c5094f] flex items-center transition-colors duration-200">
            <FiEdit className="mr-1" /> Edit Profile
          </button>
        )}
      </header>
      <div className="p-6 bg-white">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={accountFormData.name}
              onChange={handleAccountFormChange}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200 ${isAccountEditing ? 'bg-white' : 'bg-gray-50 cursor-not-allowed'}`}
              readOnly={!isAccountEditing}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={authUser.email || ''} // Always directly from authUser prop, not editable
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200 bg-gray-50 cursor-not-allowed"
              readOnly
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={accountFormData.phone}
              onChange={handleAccountFormChange}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200 ${isAccountEditing ? 'bg-white' : 'bg-gray-50 cursor-not-allowed'}`}
              readOnly={!isAccountEditing}
            />
          </div>
          {isAccountEditing && (
            <div className="pt-4 flex gap-4">
              <button
                onClick={handleSaveAccountDetails}
                className="inline-flex items-center bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-3 rounded-lg text-base font-semibold transition duration-300 ease-in-out transform hover:scale-105"
              >
                <FiSave className="mr-2" /> Save Changes
              </button>
              <button
                onClick={handleCancelAccountEdit}
                className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg text-base font-semibold transition duration-300 ease-in-out"
              >
                Cancel
              </button>
            </div>
          )}
          {!isAccountEditing && (
              <div className="pt-4">
                <button className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg text-base font-semibold cursor-not-allowed opacity-70">
                  Save Changes (Click "Edit Profile" to modify)
                </button>
              </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AccountDetailsSection;
