// lib/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Async Thunk for User Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', email, password);
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password }, {
        withCredentials: true,
      });
      console.log('Login successful:', response.data.user);
      return response.data.user; // Returning full user object
    } catch (error) {
      console.error('Login failed:', error.response?.data.error || error.message);
      return rejectWithValue(error.response?.data.error || 'Login failed. Please try again.');
    }
  }
);

// Async Thunk for Checking Auth Status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Checking authentication status...');
      const response = await axios.get(`${BACKEND_URL}/api/auth/status`, {
        withCredentials: true,
      });
      console.log('Auth status:', response.data);
      return response.data;
    } catch (error) {
      console.error('Auth check failed:', error.response?.data.error || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue('Not authenticated.');
      }
      return rejectWithValue(error.response?.data.error || 'Failed to check authentication status.');
    }
  }
);

// Async Thunk for User Logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Logging out user...');
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      });
      console.log('Logout successful.');
      return true; // Indicate success
    } catch (error) {
      console.error('Logout failed:', error.response?.data.error || error.message);
      return rejectWithValue(error.response?.data.error || 'Logout failed. Please try again.');
    }
  }
);

// Redux Slice for Authentication
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userId: null,
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    clearAuth: (state) => {
      console.log('Clearing authentication state...');
      state.userId = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    setAuthUser: (state, action) => {
      console.log('Setting authenticated user:', action.payload);
      state.user = action.payload;
      state.userId = action.payload?.id || null;
      state.isAuthenticated = !!action.payload?.id;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        console.log('Login request initiated...');
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Login successful:', action.payload);
        state.loading = false;
        state.user = action.payload;
        state.userId = action.payload.id;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.error('Login failed:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.userId = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        console.log('Checking authentication...');
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        console.log('User is authenticated:', action.payload);
        state.loading = false;
        state.user = action.payload;
        state.userId = action.payload.id;
        state.isAuthenticated = true;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        console.error('Auth check failed:', action.payload);
        state.loading = false;
        state.error = action.payload === 'Not authenticated.' ? null : action.payload;
        state.userId = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Logout User
      .addCase(logoutUser.pending, (state) => {
        console.log('Logging out...');
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('User logged out.');
        state.loading = false;
        state.userId = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        console.error('Logout failed:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.userId = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

console.log('Auth slice created:', authSlice.name);
export const { clearAuth, setAuthUser } = authSlice.actions;
export default authSlice.reducer;
