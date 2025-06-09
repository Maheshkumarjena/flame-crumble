// lib/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice'; // Adjust the import path as needed
import Wishlist from '@/app/wishlist/page';
import wishlistReducer from './features/auth/wishlistSlice'; // Adjust the import path as needed
import cartReducer from './features/auth/cartSlice'; // Adjust the import path as needed

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      Wishlist:wishlistReducer,
      cart: cartReducer,
      // Add other slices here as your application grows (e.g., products, cart, wishlist)
    },
    // Middleware and devtools are configured by default by configureStore
    // You can customize them here if needed
  });
};

// Define the AppStore type
// export type AppStore = ReturnType<typeof makeStore>;
// Define the RootState type
// export type RootState = ReturnType<AppStore['getState']>;
// Define the AppDispatch type
// export type AppDispatch = AppStore['dispatch'];
