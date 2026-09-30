import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // { id, name, email, role, avatar }
  isInitialized: false, // becomes true once we've checked /auth/me on load
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.isInitialized = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthInitialized = (state) => state.auth.isInitialized;
export const selectIsSuperAdmin = (state) => state.auth.user?.role === 'superadmin';
