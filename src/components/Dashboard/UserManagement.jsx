// components/Admin/UserManagement.jsx
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUserCheck, FiUserX, FiMail, FiPhone } from 'react-icons/fi'; // Icons for user management

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming /api/admin/users is an admin-protected endpoint
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
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }
    setLoading(true); // Indicate loading for the action
    setError(null);
    try {
      // Assuming /api/admin/users/:id/role is an admin-protected endpoint
      await axios.patch(`${BACKEND_URL}/api/admin/users/${userId}/role`, { role: newRole }, {
        withCredentials: true,
      });
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError(err.response?.data?.error || 'Failed to update user role.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Assuming /api/admin/users/:id is an admin-protected endpoint
      await axios.delete(`${BACKEND_URL}/api/admin/users/${userId}`, {
        withCredentials: true,
      });
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err.response?.data?.error || 'Failed to delete user.');
    } finally {
      setLoading(false);
    }
  };


  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E30B5D]"></div>
        <p className="ml-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">User Management</h2>
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-700">All Users</h3>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

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
            {users.map((user) => (
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
                    value={user.role}
                    onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white mr-2"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button 
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
