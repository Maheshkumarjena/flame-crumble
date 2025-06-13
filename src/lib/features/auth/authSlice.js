import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Helper function for consistent error handling
const handleAuthError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.error || 'Authentication failed',
      status: error.response.status,
      isNetworkError: false
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'Network error - unable to reach server',
      status: null,
      isNetworkError: true
    };
  }
  // Other errors
  return {
    message: error.message || 'An unexpected error occurred',
    status: null,
    isNetworkError: false
  };
};

// Async Thunk for User Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, 
        { email, password },
        { withCredentials: true }
      );
      return {
        user: response.data.user,
        timestamp: Date.now()
      };
    } catch (error) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

// Async Thunk for Checking Auth Status with caching
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    
    // Skip if we recently checked (5 minute cache)
    if (auth.lastChecked && (Date.now() - auth.lastChecked < 300000)) {
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/status`, {
        withCredentials: true,
      });
      return {
        user: response.data,
        timestamp: Date.now()
      };
    } catch (error) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

// Async Thunk for User Logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      });
      return { timestamp: Date.now() };
    } catch (error) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

// Redux Slice for Authentication
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    isAdmin: false,
    lastChecked: null,
    initialized: false
  },
  reducers: {
    // Manual state reset
    resetAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.lastChecked = null;
    },
    // Silent refresh for token updates
    updateAuthToken: (state, action) => {
      if (state.user) {
        state.user.accessToken = action.payload.token;
        state.lastChecked = Date.now();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login User Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isAdmin = action.payload.user.role === 'admin';
        state.lastChecked = action.payload.timestamp;
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.initialized = true;
      })

      // Check Auth Status Cases
      .addCase(checkAuthStatus.pending, (state) => {
        if (!state.initialized) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        if (action.payload) { // Skip if cached
          state.loading = false;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.isAdmin = action.payload.user.role === 'admin';
          state.lastChecked = action.payload.timestamp;
        }
        state.initialized = true;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        
        // Only reset auth state for 401/403 errors
        if (action.payload?.status === 401 || action.payload?.status === 403) {
          state.user = null;
          state.isAuthenticated = false;
          state.isAdmin = false;
        }
        
        state.error = action.payload;
        state.initialized = true;
      })

      // Logout User Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.lastChecked = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetAuth, updateAuthToken } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.isAdmin;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthInitialized = (state) => state.auth.initialized;

export default authSlice.reducer;