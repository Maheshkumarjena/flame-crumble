// components/UserAccount/AccountDetailsSection.jsx
import React, { useState, useEffect } from 'react';
import { FiEdit, FiSave } from 'react-icons/fi';
import axios from 'axios';

const AccountDetailsSection = ({ authUser, dispatch, setAuthUser, BACKEND_URL, displayLocalMessage }) => {
  const [isAccountEditing, setIsAccountEditing] = useState(false);
  const [accountFormData, setAccountFormData] = useState({ name: '', phone: '' });

  // Effect to initialize account form data when authUser changes or component mounts
  useEffect(() => {
    if (authUser) {
      setAccountFormData({
        name: authUser.name || '',
        phone: authUser.phone || ''
      });
    }
  }, [authUser]);

  // Handles account details editing
  const handleEditAccountClick = () => {
    setIsAccountEditing(true);
    setAccountFormData({
      name: authUser.name || '',
      phone: authUser.phone || ''
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
      const response = await axios.put(`${BACKEND_URL}/api/auth/me`, accountFormData, {
        withCredentials: true,
      });
      // Update Redux store with new user data
      dispatch(setAuthUser(response.data.user)); // Dispatch the action creator
      setIsAccountEditing(false);
      displayLocalMessage('success', 'Account details updated successfully!');
    } catch (err) {
      console.error('Error updating account details:', err);
      displayLocalMessage('error', err.response?.data?.error || 'Failed to update account details.');
    }
  };

  const handleCancelAccountEdit = () => {
    setIsAccountEditing(false);
    // Reset form data to current authUser data
    setAccountFormData({
      name: authUser.name || '',
      phone: authUser.phone || ''
    });
  };

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
              value={authUser.email || ''} // Email is not editable
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
