import { createSlice } from "@reduxjs/toolkit";

const TOKEN_STORAGE_KEY = "ngfw_auth_token";

const storedToken =
  typeof window !== "undefined"
    ? localStorage.getItem(TOKEN_STORAGE_KEY)
    : null;

const initialState = {
  user: null,
  token: storedToken,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      if (action.payload.token) {
        state.token = action.payload.token;
        localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.token);
      }
      state.isInitialized = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectIsAuthInitialized = (state) => state.auth.isInitialized;
export const selectIsSuperAdmin = (state) =>
  state.auth.user?.role === "superadmin";
