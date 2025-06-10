// components/UserAccount/AccountDetailsSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiSave } from 'react-icons/fi';
import axios from 'axios';
import { setAuthUser } from '@/lib/features/auth/authSlice'; // Make sure to import setAuthUser

const AccountDetailsSection = ({ authUser, dispatch, BACKEND_URL, displayLocalMessage }) => {
  const [isAccountEditing, setIsAccountEditing] = useState(false);
  const [accountFormData, setAccountFormData] = useState({ name: '', phone: '' });
  const [loadingUserDetails, setLoadingUserDetails] = useState(true);
  const [userDetails, setUserDetails] = useState(null);

  // Use a ref to track if initial data has been loaded
  const initialDataLoaded = React.useRef(false); // Using React.useRef

  // Function to fetch user details
  const fetchUserDetails = useCallback(async (userId) => {
    if (!userId) {
      setLoadingUserDetails(false);
      return;
    }
    setLoadingUserDetails(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/${userId}`, {
        withCredentials: true,
      });
      setUserDetails(response.data.user);
      // Initialize form data with fetched details
      setAccountFormData({
        name: response.data.user.name || '',
        phone: response.data.user.phone || ''
      });
      initialDataLoaded.current = true; // Mark as loaded
    } catch (err) {
      console.error('Error fetching user details:', err);
      displayLocalMessage('error', err.response?.data?.error || 'Failed to load account details.');
      setUserDetails(null);
    } finally {
      setLoadingUserDetails(false);
    }
  }, [BACKEND_URL, displayLocalMessage]); // Dependencies for useCallback

  // Effect to fetch user details when authUser.userId changes, but ONLY if not already loaded
  useEffect(() => {
    // Only fetch if we have a userId and we haven't already loaded initial data
    if (authUser?.userId && !initialDataLoaded.current) {
      fetchUserDetails(authUser.userId);
    } else if (!authUser?.userId) {
      // If authUser.userId becomes null (e.g., logout), stop loading
      setLoadingUserDetails(false);
    }
  }, [authUser?.userId]); // Dependencies

  // Handles account details editing
  const handleEditAccountClick = () => {
    setIsAccountEditing(true);
    // When starting edit, always reset form data to current userDetails data
    setAccountFormData({
      name: userDetails?.name || '',
      phone: userDetails?.phone || ''
    });
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

      const response = await axios.put(`${BACKEND_URL}/api/auth/me/${authUser.userId}`, payload, {
        withCredentials: true,
      });

      // Update local userDetails state
      setUserDetails(response.data.user);

      // IMPORTANT: Only update Redux with *specific* user properties if the parent authUser
      // only holds ID and loggedIn. If parent authUser *is* the full user object,
      // this Redux update needs to be carefully managed to avoid triggering the useEffect again.
      // If the parent `authUser` is *always* just `{loggedIn, userId}`,
      // then updating it with more details here is fine, as it won't change the `userId` prop.
      // If the parent `authUser` *could* become the full object, this is where the loop happens.
      // Assuming parent `authUser` remains `{loggedIn, userId}` from the `UserAccount` component's perspective:
      dispatch(setAuthUser({
        ...authUser, // Keep existing loggedIn, userId
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone,
      }));

      setIsAccountEditing(false);
      displayLocalMessage('success', 'Account details updated successfully!');
    } catch (err) {
      console.error('Error updating account details:', err);
      displayLocalMessage('error', err.response?.data?.error || 'Failed to update account details.');
    }
  };

  const handleCancelAccountEdit = () => {
    setIsAccountEditing(false);
    // Reset form data to current userDetails data
    setAccountFormData({
      name: userDetails?.name || '',
      phone: userDetails?.phone || ''
    });
  };

  // Show loading spinner while fetching user details
  if (loadingUserDetails) {
    return (
      <section className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#E30B5D]"></div>
      </section>
    );
  }

  // If userDetails is null after loading (e.g., failed to fetch)
  if (!userDetails) {
    return (
      <section className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 text-center text-red-600">
        <p>Could not load account details. Please try again later.</p>
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
              value={userDetails.email || ''}
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