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

// Basic selector to get the authentication status
const selectAuthSlice = (state) => state.auth;

export const selectIsAuthenticated = createSelector(
  [selectAuthSlice],
  (auth) => auth?.isAuthenticated || false
);
