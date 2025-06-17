// components/Admin/UserManagement.jsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // We'll keep axios here for direct API calls
import { useSelector } from 'react-redux'; // Still need useSelector for current user/admin status

import AdminSidebar from '@/components/Dashboard/ui/AdminSidebar';
import { FiUserCheck, FiUserX, FiTrash, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { current } from '@reduxjs/toolkit';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// A simple message box component (no changes needed)
const MessageBox = ({ type, message, onClose }) => {
  if (!message) return null;

  const baseClasses = "p-4 mb-4 rounded-md flex items-center shadow-sm";
  let typeClasses = "";
  let IconComponent = null;

  switch (type) {
    case 'success':
      typeClasses = "bg-green-100 border-l-4 border-green-500 text-green-700";
      IconComponent = FiCheckCircle;
      break;
    case 'error':
      typeClasses = "bg-red-100 border-l-4 border-red-500 text-red-700";
      IconComponent = FiAlertCircle;
      break;
    default:
      typeClasses = "bg-blue-100 border-l-4 border-blue-500 text-blue-700";
      IconComponent = FiAlertCircle; // Default icon
      break;
  }

  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      {IconComponent && <IconComponent className="mr-3 text-lg" />}
      <div className="flex-grow">
        <p className="font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-current hover:opacity-75">
          <FiX size={18} />
        </button>
      )}
    </div>
  );
};

// Custom Confirmation Modal component (no changes needed)
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative text-center">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Action</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Component-local states for user data and management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Confirmation modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [actionToConfirm, setActionToConfirm] = useState(null); // Stores the function to call on confirm

  // Get the current logged-in user from Redux to prevent self-actions
  const currentUser = useSelector((state) => state.auth.user);

  console.log(
    "current user", currentUser
  )

  // --- Data Fetching ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Clear messages on new fetch
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
        withCredentials: true,
      });
      setUsers(response.data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.error || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies means this function is stable

  useEffect(() => {
    fetchUsers(); // Initial fetch when component mounts
  }, [fetchUsers]); // Re-run if fetchUsers changes (though it's useCallback'd to be stable)

  // --- User Role Update Logic ---
  const handleUpdateUserRole = (userId, newRole) => {
    // Prevent an admin from changing their own role
    if (currentUser && currentUser._id === userId) {
      setError("You cannot change your own role.");
      return;
    }
    setConfirmModalMessage(`Are you sure you want to change this user's role to "${newRole}"?`);
    setActionToConfirm(() => () => executeUpdateUserRole(userId, newRole));
    setIsConfirmModalOpen(true);
  };

  const executeUpdateUserRole = async (userId, newRole) => {
    console.log("users", users)
    setIsConfirmModalOpen(false); // Close modal immediately
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await axios.patch(`${BACKEND_URL}/api/admin/users/${userId}/role`, { role: newRole, userId: userId }, {
        withCredentials: true,

      });
      setSuccessMessage(`User role updated to "${newRole}" successfully!`);
      fetchUsers(); // Re-fetch users to update the UI with the new role
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError(err.response?.data?.error || 'Failed to update user role.');
    } finally {
      setLoading(false);
    }
  };

  // --- User Deletion Logic ---
  const handleDeleteUser = (userId) => {
    console.log("users", users)
    

    // Prevent an admin from deleting themselves
    if (currentUser && currentUser._id === userId) {
      setError("You cannot delete your own account.");
      return;
    }
    setConfirmModalMessage('Are you sure you want to delete this user? This action cannot be undone.');
    setActionToConfirm(() => () => executeDeleteUser(userId));
    setIsConfirmModalOpen(true);
  };

  const executeDeleteUser = async (userId) => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // CORRECT AXIOS.DELETE SYNTAX:
      // Argument 1: URL
      // Argument 2: Config object (where 'data' and 'withCredentials' reside)
      await axios.delete(`${BACKEND_URL}/api/admin/users/${userId}`, {
        withCredentials: true,
        // Only include 'data' if your backend specifically reads req.body for DELETE.
        // If your backend relies solely on req.params.id (which is standard),
        // you don't even need the 'data' property here.
      }, {      data: currentUser, // This is where you put your data for the body
});
      setSuccessMessage('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      // Log the full error response for more details
      console.error('Full error response:', err.response);
      setError(err.response?.data?.error || 'Failed to delete user.');
    } finally {
      setLoading(false);
    }
  };

  // --- Modal Management ---
  const closeConfirmModals = () => {
    setIsConfirmModalOpen(false);
    setConfirmModalMessage('');
    setActionToConfirm(null);
  };

  // --- Loading State Render ---
  if (loading && users.length === 0 && !error) { // Only show loading spinner if no users loaded yet and no initial error
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E30B5D]"></div>
        <p className="ml-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">

      <div className='flex flex-row'>
        <h2 className="text-3xl m-auto font-bold text-gray-800 mb-6">Users Management</h2>
      </div>

      {/* Message Boxes for errors and success */}
      <MessageBox type="error" message={error} onClose={() => setError(null)} />
      <MessageBox type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />

      <div className='flex flex-row min-h-full'>

      <AdminSidebar mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isVerified ? (
                      <FiUserCheck className="text-green-500" size={20} title="Email Verified" />
                    ) : (
                      <FiUserX className="text-red-500" size={20} title="Email Not Verified" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <select
                      id={user._id}
                      value={user.role}
                      onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white mr-2 focus:ring-[#E30B5D] focus:border-[#E30B5D]"
                      aria-label="Change user role"
                      // Disable changing own role for the currently logged-in admin
                      disabled={currentUser && currentUser._id === user._id}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className={`ml-2 p-1 rounded transition-colors ${currentUser && currentUser._id === user._id
                          ? 'text-gray-400 cursor-not-allowed' // Grey out and disable if it's the current admin
                          : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                        }`}
                      aria-label="Delete user"
                      // Disable deleting own account for the currently logged-in admin
                      disabled={currentUser && currentUser._id === user._id}
                    >
                      <FiTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  {loading ? "Loading users..." : error ? "Error loading users." : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
      

      {/* Single Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        message={confirmModalMessage}
        onConfirm={() => {
          if (actionToConfirm) actionToConfirm();
          // The modal is closed by the execute functions themselves to ensure
          // it closes after the async action is dispatched.
          // closeConfirmModals(); // This line is not needed here if execute functions close it
        }}
        onCancel={closeConfirmModals}
        confirmText={actionToConfirm && actionToConfirm.name.includes('Delete') ? 'Delete' : 'Confirm'}
      />
    </div>
  );
};

export default UserManagement;