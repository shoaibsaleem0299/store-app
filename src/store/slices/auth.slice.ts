import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null as any, isAuthenticated: false, isInitialized: false },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
