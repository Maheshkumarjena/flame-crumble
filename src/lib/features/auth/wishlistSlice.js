// lib/features/wishlist/wishlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Async Thunk for fetching the user's wishlist
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue, getState }) => {
    const { auth } = getState(); // Get auth state to check if user is logged in
    if (!auth.isAuthenticated) {
      // If not authenticated, we don't proceed with fetching but don't error out
      // Instead, we return an empty array and let the UI handle the not-logged-in state
      return []; 
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/api/wishlist`, {
        withCredentials: true,
      });
      return response.data.items; // Assuming backend returns { items: [...] }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // If it's a 401/403, we should let the auth slice handle re-authentication/redirection.
        // For wishlist specific errors, return the error.
        if (error.response.status === 401 || error.response.status === 403) {
            // Signal that auth is needed, but don't populate wishlist with an error
            return rejectWithValue('Authentication required or session expired.');
        }
        return rejectWithValue(error.response.data.error || 'Failed to fetch wishlist.');
      }
      return rejectWithValue('Network error or unexpected issue fetching wishlist.');
    }
  }
);

// Async Thunk for adding/removing items from wishlist
export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggleWishlistItem',
  async (productId, { rejectWithValue, getState, dispatch }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue('Please log in to manage your wishlist.');
    }

    try {
      // Safely access current wishlist items from the state
      const currentWishlistItems = getState().wishlist?.items || []; // <-- Added optional chaining here
      const isCurrentlyInWishlist = currentWishlistItems.some(item => item.product?._id === productId);

      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        await axios.delete(`${BACKEND_URL}/api/wishlist/${productId}`, {
          withCredentials: true,
        });
        // Dispatch fetchWishlist to ensure the state is fully consistent with backend after action
        dispatch(fetchWishlist()); 
        return { productId, action: 'removed' };
      } else {
        // Add to wishlist
        await axios.post(`${BACKEND_URL}/api/wishlist`, { productId }, {
          withCredentials: true,
        });
        // Dispatch fetchWishlist to get the newly added item with populated product data
        dispatch(fetchWishlist());
        return { productId, action: 'added' };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle specific auth errors for redirection
        if (error.response.status === 401 || error.response.status === 403) {
          // This error will be caught by ProductCard and trigger alert/redirection
          return rejectWithValue('Authentication required to update wishlist.');
        }
        return rejectWithValue(error.response.data.error || 'Failed to update wishlist.');
      }
      return rejectWithValue('Network error or unexpected issue updating wishlist.');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],        // Stores populated wishlist items
    loading: false,   // Loading state for wishlist operations
    error: null,      // Error message for wishlist operations
  },
  reducers: {
    // Synchronous action to clear wishlist state (e.g., on logout)
    clearWishlist: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // Payload is the array of wishlist items
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = []; // Clear items on error or authentication failure
      })
      // Toggle Wishlist Item (pending/fulfilled/rejected for the toggle operation itself)
      .addCase(toggleWishlistItem.pending, (state) => {
        state.loading = true; // Set loading true while toggling
        state.error = null;
      })
      .addCase(toggleWishlistItem.fulfilled, (state) => {
        state.loading = false; // Loading will be set to false by fetchWishlist's fulfilled action as well
        // State update happens via fetchWishlist dispatch, so no direct mutation here
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
