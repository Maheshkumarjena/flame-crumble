// utils/authUtils.js
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * @function checkAuthStatus
 * @returns {Promise<boolean>} True if the user is authenticated, false otherwise.
 * @description Checks the user's authentication status by making a request to a protected endpoint.
 * Relies on the backend's cookie-based JWT authentication.
 */
export async function checkAuthStatus() {
  try {
    // Make a lightweight request to a protected endpoint.
    // The backend's `authenticate` middleware will determine if the cookie is valid.
    await axios.get(`${BACKEND_URL}/api/auth/status`, {
      withCredentials: true, // Essential for sending the HTTP-only cookie
    });
    return true; // If the request succeeds (status 200), the user is authenticated
  } catch (error) {
    // Axios throws an error for non-2xx status codes (like 401 Unauthorized, 403 Forbidden)
    // If the error indicates authentication failure, the user is not logged in.
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        console.log('User not authenticated.');
        return false;
      }
    }
    // For other errors (e.g., network issues, server errors), log and assume not logged in for safety
    console.error('Error checking authentication status:', error);
    return false;
  }
}