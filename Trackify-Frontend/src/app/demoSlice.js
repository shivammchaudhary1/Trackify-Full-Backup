import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { client } from "##/src/client.js";

export const getDemoState = createAsyncThunk(
  "demo/getDemoState",
  async (_, { rejectWithValue }) => {
    try {
      const response = await client.get("/api/profile/demo-state");
      return response;
    } catch (error) {
      console.error('Error fetching demo state:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateDemoState = createAsyncThunk(
  "demo/updateDemoState",
  async (isDemoDone, { rejectWithValue, dispatch }) => {
    try {
      const response = await client.patch("/api/profile/demo-state", { isDemoDone });
      
      // After successful update, fetch the latest state from backend
      dispatch(getDemoState());
      
      return response;
    } catch (error) {
      console.error('Update error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isDemoDone: false, // Set to false by default for new users
  currentSlide: 0,
  loading: false,
  error: null,
};

const demoSlice = createSlice({
  name: "demo",
  initialState,
  reducers: {
    nextSlide: (state) => {
      state.currentSlide += 1;
    },
    previousSlide: (state) => {
      state.currentSlide = Math.max(0, state.currentSlide - 1);
    },
    resetDemo: (state) => {
      state.currentSlide = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDemoState.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDemoState.fulfilled, (state, action) => {
        state.loading = false;
        state.isDemoDone = action.payload.isDemoDone;
        state.error = null;
      })
      .addCase(getDemoState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDemoState.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDemoState.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateDemoState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { nextSlide, previousSlide, resetDemo } = demoSlice.actions;
export default demoSlice.reducer;
