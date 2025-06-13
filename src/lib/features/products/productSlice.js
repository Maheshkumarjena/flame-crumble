// lib/features/products/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Async Thunk for fetching all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Ensure user is authenticated and is admin (middleware on backend should handle this)
      const response = await axios.get(`${BACKEND_URL}/api/admin/products`, {
        withCredentials: true,
      });
      return response.data.products; // Assuming backend returns { products: [...] }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to fetch products.');
      }
      return rejectWithValue('Network error or unexpected issue fetching products.');
    }
  }
);

// Async Thunk for adding a new product
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/products`, productData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' } // Important for FormData
      });
      dispatch(fetchProducts()); // Re-fetch products after successful add to update list
      return response.data.product;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to add product.');
      }
      return rejectWithValue('Network error or unexpected issue adding product.');
    }
  }
);

// Async Thunk for updating an existing product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/admin/products/${productId}`, productData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' } // Important for FormData
      });
      dispatch(fetchProducts()); // Re-fetch products after successful update to update list
      return response.data.product;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to update product.');
      }
      return rejectWithValue('Network error or unexpected issue updating product.');
    }
  }
);

// Async Thunk for deleting a product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/products/${productId}`, {
        withCredentials: true,
      });
      dispatch(fetchProducts()); // Re-fetch products after successful delete to update list
      return productId;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to delete product.');
      }
      return rejectWithValue('Network error or unexpected issue deleting product.');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProducts: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })
      // Add Product
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state) => {
        state.loading = false;
        // The list will be updated by fetchProducts() dispatched above
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.loading = false;
        // The list will be updated by fetchProducts() dispatched above
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.loading = false;
        // The list will be updated by fetchProducts() dispatched above
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProducts } = productSlice.actions;
export default productSlice.reducer;
