// lib/selectors.js
import { createSelector } from '@reduxjs/toolkit';

// Basic selector to get the wishlist slice from the state
const selectWishlistSlice = (state) => state.wishlist;


// Memoized selector for wishlist items
// It will only recompute if state.wishlist.items changes its reference.
export const selectWishlistItems = createSelector(
  [selectWishlistSlice], // Input selectors: the slice of state we depend on
  (wishlist) => wishlist?.items || [] // Output selector: return the items array or an empty array
);

// Basic selector to get the wishlist loading state
export const selectWishlistLoading = createSelector(
  [selectWishlistSlice],
  (wishlist) => wishlist?.loading || false
);

// Basic selector to get the authentication slice from the state
const selectAuthSlice = (state) => state.auth;

// Memoized selector for authentication status
export const selectIsAuthenticated = createSelector(
  [selectAuthSlice],
  (auth) => auth?.isAuthenticated || false
);

// Memoized selector for the full authenticated user object
export const selectAuthUser = createSelector(
  [selectAuthSlice],
  (auth) => auth?.user || null
);

// Memoized selector for the authentication loading state
export const selectAuthLoading = createSelector(
  [selectAuthSlice],
  (auth) => auth?.loading || false
);



// NEW: Memoized selector to check if the user is an admin
export const selectIsAdmin = createSelector(
  [selectAuthUser], // Depends on the full auth user object
  (user) => user?.role  // Check if the user's role is 'admin'
  // (user) => user?.role === 'admin' // Check if the user's role is 'admin'

);


