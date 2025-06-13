// lib/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice'; // Adjust the import path as needed
import Wishlist from '@/app/wishlist/page';
import wishlistReducer from './features/auth/wishlistSlice'; // Adjust the import path as needed
import cartReducer from './features/auth/cartSlice'; // Adjust the import path as needed
import productReducer from './features/products/productSlice'; // Adjust the import path as needed

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      wishlist:wishlistReducer,
      cart: cartReducer,
      product:productReducer
      // Add other slices here as your application grows (e.g., products, cart, wishlist)
    },
    
  });
};

