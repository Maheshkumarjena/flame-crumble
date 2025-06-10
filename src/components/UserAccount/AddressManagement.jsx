// components/UserAccount/AddressManagement.jsx
import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPlus, FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import axios from 'axios';

// Address Form Component (now rendered inline)
const AddressForm = ({ onCancel, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    type: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    isDefault: false,
  });
  const [formError, setFormError] = useState(null); // State for internal form errors

  // Populate form data if editing an existing address
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'Home',
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        line1: initialData.line1 || '',
        line2: initialData.line2 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zip: initialData.zip || '',
        country: initialData.country || '',
        isDefault: initialData.isDefault || false,
      });
    } else {
      // Reset for new address
      setFormData({
        type: 'Home',
        fullName: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        isDefault: false,
      });
    }
    setFormError(null); // Clear errors on form open/initialData change
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors

    // Basic validation
    if (!formData.fullName || !formData.phone || !formData.line1 || !formData.city || !formData.state || !formData.zip || !formData.country) {
      setFormError('Please fill in all required address fields.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100"> {/* Adjusted styling for inline display */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{initialData ? 'Edit Address' : 'Add New Address'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
          <FiX className="text-2xl" />
        </button>
      </div>
      {formError && (
        <div className="bg-red-100 border border-red-300 text-red-800 p-3 mb-4 rounded-lg text-sm">
          {formError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
            required
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
            placeholder="e.g., John Doe"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
            placeholder="e.g., +1234567890"
            required
          />
        </div>
        <div>
          <label htmlFor="line1" className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
          <input
            type="text"
            id="line1"
            name="line1"
            value={formData.line1}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
            placeholder="Street address, P.O. Box, company name, c/o"
            required
          />
        </div>
        <div>
          <label htmlFor="line2" className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
          <input
            type="text"
            id="line2"
            name="line2"
            value={formData.line2}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
            placeholder="Apartment, suite, unit, building, floor, etc."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">Zip / Postal Code</label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30B5D] focus:border-transparent transition duration-200"
              required
            />
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="h-4 w-4 text-[#E30B5D] focus:ring-[#E30B5D] border-gray-300 rounded"
          />
          <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">Set as default address</label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-2 rounded-lg text-base font-semibold transition duration-300 ease-in-out transform hover:scale-105"
          >
            <FiSave className="mr-2" /> {initialData ? 'Save Changes' : 'Add Address'}
          </button>
        </div>
      </form>
    </div>
  );
};


const AddressManagement = ({ addresses, fetchAddresses, BACKEND_URL, displayLocalMessage }) => {
  const [showAddressForm, setShowAddressForm] = useState(false); // Renamed from showAddressModal
  const [editingAddress, setEditingAddress] = useState(null); // Stores address being edited, null for new

  // Handles opening the address form for adding a new address
  const handleAddAddressClick = () => {
    setEditingAddress(null); // No address is being edited (it's a new one)
    setShowAddressForm(true);
  };

  // Handles opening the address form for editing an existing address
  const handleEditAddressClick = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  // Handles submitting the address form (add or update)
  const handleAddressSubmit = async (addressData) => {
    setShowAddressForm(false); // Hide form immediately after submission
    displayLocalMessage('', ''); // Clear any existing messages

    try {
      if (editingAddress) {
        // Update existing address
        await axios.put(`${BACKEND_URL}/api/addresses/${editingAddress._id}`, addressData, {
          withCredentials: true,
        });
        displayLocalMessage('success', 'Address updated successfully!');
      } else {
        // Add new address
        await axios.post(`${BACKEND_URL}/api/addresses`, addressData, {
          withCredentials: true,
        });
        displayLocalMessage('success', 'Address added successfully!');
      }
      fetchAddresses(); // Re-fetch addresses to update the list
    } catch (err) {
      console.error('Error submitting address:', err);
      displayLocalMessage('error', err.response?.data?.error || 'Failed to save address.');
    }
  };

  // Handles deleting an address
  const handleDeleteAddress = async (addressId) => {
    // For simplicity, using window.confirm. In a production app, use a custom modal.
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }
    displayLocalMessage('', ''); // Clear any existing messages
    try {
      await axios.delete(`${BACKEND_URL}/api/addresses/${addressId}`, {
        withCredentials: true,
      });
      displayLocalMessage('success', 'Address deleted successfully!');
      fetchAddresses(); // Re-fetch addresses to update the list
    } catch (err) {
      console.error('Error deleting address:', err);
      displayLocalMessage('error', err.response?.data?.error || 'Failed to delete address. Make sure it\'s not the only address or default.');
    }
  };

  // Handles setting an address as default
  const handleSetDefaultAddress = async (addressId) => {
    displayLocalMessage('', ''); // Clear any existing messages
    try {
      await axios.patch(`${BACKEND_URL}/api/addresses/${addressId}/set-default`, {}, {
        withCredentials: true,
      });
      displayLocalMessage('success', 'Address set as default!');
      fetchAddresses(); // Re-fetch addresses to update the list
    } catch (err) {
      console.error('Error setting default address:', err);
      displayLocalMessage('error', err.response?.data?.error || 'Failed to set address as default.');
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <header className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Saved Addresses</h2>
        {/* Only show "Add New Address" button if the form is not already open */}
        {!showAddressForm && (
          <button onClick={handleAddAddressClick} className="text-base font-semibold text-[#E30B5D] hover:text-[#c5094f] flex items-center transition-colors duration-200">
            <FiPlus className="mr-1" /> Add New Address
          </button>
        )}
      </header>
      {showAddressForm ? (
        // Render the inline AddressForm when showAddressForm is true
        <AddressForm
          onCancel={() => setShowAddressForm(false)}
          onSubmit={handleAddressSubmit}
          initialData={editingAddress}
        />
      ) : (
        // Render the address list when the form is not shown
        addresses.length === 0 ? (
          <div className="p-8 text-center bg-white">
            <FiMapPin className="mx-auto text-gray-400 text-6xl mb-4" />
            <p className="text-gray-500 mb-6 text-lg">You haven't saved any addresses yet.</p>
            <button onClick={handleAddAddressClick} className="inline-flex items-center bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-3 rounded-lg text-base font-semibold transition duration-300 ease-in-out transform hover:scale-105">
              <FiPlus className="mr-2" /> Add First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white">
            {addresses.map((address) => (
              <div key={address._id || address.id} className="border border-gray-200 rounded-lg p-6 relative bg-white hover:shadow-md transition-shadow duration-200">
                {address.isDefault && (
                  <span className="absolute top-4 right-4 bg-[#E30B5D] text-white text-xs px-3 py-1 rounded-full font-medium">
                    Default
                  </span>
                )}
                <h3 className="font-semibold text-lg text-gray-800 mb-2">{address.type || 'Address'}</h3>
                <p className="text-gray-600">{address.fullName}</p>
                <p className="text-gray-600">{address.phone}</p>
                <p className="text-gray-600">{address.line1}</p>
                {address.line2 && <p className="text-gray-600">{address.line2}</p>}
                <p className="text-gray-600">{address.city}, {address.state} {address.zip}</p>
                <p className="text-gray-600">{address.country}</p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <button onClick={() => handleEditAddressClick(address)} className="text-sm font-semibold text-[#E30B5D] hover:text-[#c5094f] flex items-center transition-colors duration-200">
                    <FiEdit className="mr-1" /> Edit
                  </button>
                  {!address.isDefault && (
                    <button onClick={() => handleSetDefaultAddress(address._id)} className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors duration-200">
                      Set as Default
                    </button>
                  )}
                  <button onClick={() => handleDeleteAddress(address._id)} className="text-sm font-semibold text-red-500 hover:text-red-700 flex items-center transition-colors duration-200">
                    <FiTrash2 className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  );
};

export default AddressManagement;
