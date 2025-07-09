// authSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";

const logout = createAsyncThunk("auth/logout", async (credentials) => {
  return FetchApi.fetch(`${config.api}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    credentials: "include",
  });
});

// Define a slice of state for authentication
const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    reload: false,
  },
  reducers: {
    logout(state) {
      state = {};
    },
    setIsAuthenticated(state, { payload }) {
      if (!payload.isAuthenticated) {
        state.reload = true;
      }
      state.isAuthenticated = payload.isAuthenticated;
    },
    stopReload(state, { payload }) {
      state.reload = false;
    },
  },
  extraReducers(builder) {
    builder.addCase(logout.fulfilled, (state, { payload }) => {
      state.isAuthenticated = false;
      state.reload = true;
    });
  },
});

const selectShouldReload = (state) => state.auth.reload;
const selectAuthenticated = (state) => state.auth.isAuthenticated;
const selectAuthData = (state) => state.auth;
// Export the slice reducer and the logout action creator
const { setIsAuthenticated, stopReload } = authSlice.actions;
export {
  selectAuthenticated,
  selectAuthData,
  logout,
  setIsAuthenticated,
  stopReload,
  selectShouldReload,
};
export default authSlice.reducer;
