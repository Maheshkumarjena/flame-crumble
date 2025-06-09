// lib/features/cart/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Async Thunk for fetching the user's cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue, getState }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue('User not authenticated for cart.');
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/api/cart`, {
        withCredentials: true,
      });
      return response.data.items; // Assuming backend returns { items: [...] }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to fetch cart.');
      }
      return rejectWithValue('Network error or unexpected issue fetching cart.');
    }
  }
);

// Async Thunk for adding an item to the cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue, getState, dispatch }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue('Please log in to add items to cart.');
    }
    try {
      await axios.post(`${BACKEND_URL}/api/cart`, { productId, quantity }, {
        withCredentials: true,
      });
      dispatch(fetchCart()); // Re-fetch cart to get the updated populated items
      return { productId, quantity, action: 'added' };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to add item to cart.');
      }
      return rejectWithValue('Network error or unexpected issue adding to cart.');
    }
  }
);

// Async Thunk for updating cart item quantity
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ itemId, newQuantity }, { rejectWithValue, getState, dispatch }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue('Please log in to update your cart.');
    }
    if (newQuantity < 1) {
      return rejectWithValue('Quantity cannot be less than 1.');
    }
    try {
      await axios.patch(`${BACKEND_URL}/api/cart/${itemId}`, { quantity: newQuantity }, {
        withCredentials: true,
      });
      dispatch(fetchCart()); // Re-fetch cart to get the updated populated items
      return { itemId, newQuantity, action: 'updated' };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to update cart item quantity.');
      }
      return rejectWithValue('Network error or unexpected issue updating cart.');
    }
  }
);

// Async Thunk for removing an item from the cart
export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue, getState, dispatch }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue('Please log in to remove items from cart.');
    }
    try {
      await axios.delete(`${BACKEND_URL}/api/cart/${itemId}`, {
        withCredentials: true,
      });
      dispatch(fetchCart()); // Re-fetch cart to get the updated populated items
      return { itemId, action: 'removed' };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to remove item from cart.');
      }
      return rejectWithValue('Network error or unexpected issue removing from cart.');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],        // Stores populated cart items
    loading: false,   // Loading state for cart operations
    error: null,      // Error message for cart operations
  },
  reducers: {
    // Clear cart state (e.g., on logout)
    clearCart: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // Payload is the array of cart items
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = []; // Clear items on error
      })
      // Add To Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false;
        // State update happens via fetchCart dispatch
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Cart Item Quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state) => {
        state.loading = false;
        // State update happens via fetchCart dispatch
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove Cart Item
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state) => {
        state.loading = false;
        // State update happens via fetchCart dispatch
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
