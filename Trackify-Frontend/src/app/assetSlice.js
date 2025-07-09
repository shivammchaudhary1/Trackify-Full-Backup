import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";

export const fetchAssets = createAsyncThunk(
  "assets/fetchAssets",
  async (_, { getState }) => {
    const user = getState().user.profile;
    if (!user || !user.currentWorkspace) {
      throw new Error("User workspace information not available");
    }
    const response = await FetchApi.fetch(
      `${config.api}/api/user/assets?workspaceId=${user.currentWorkspace}`
    );
    return response;
  }
);

export const addAsset = createAsyncThunk(
  "assets/addAsset",
  async (assetData, { getState }) => {
    const user = getState().user.profile;
    if (!user || !user.currentWorkspace) {
      throw new Error("User workspace information not available");
    }
    const response = await FetchApi.fetch(`${config.api}/api/user/assets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...assetData,
        workspaceId: user.currentWorkspace,
      }),
    });

    return {
      ...response,
      userId: user._id,
      userName: user.name,
    };
  }
);

export const updateAsset = createAsyncThunk(
  "assets/updateAsset",
  async (assetData, { getState }) => {
    const user = getState().user.profile;
    if (!user || !user.currentWorkspace) {
      throw new Error("User workspace information not available");
    }
    const response = await FetchApi.fetch(
      `${config.api}/api/user/assets/update`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...assetData,
          workspaceId: user.currentWorkspace,
        }),
      }
    );
    return response;
  }
);

export const deleteAsset = createAsyncThunk(
  "assets/deleteAsset",
  async (assetData, { getState, rejectWithValue }) => {
    const user = getState().user.profile;

    if (!user || !user.currentWorkspace) {
      return rejectWithValue("User workspace information not available");
    }

    if (!assetData.assetId) {
      return rejectWithValue("Asset ID is required for deletion");
    }

    try {
      const response = await FetchApi.fetch(
        `${config.api}/api/user/assets/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assetId: assetData.assetId,
            isPrimary: assetData.isPrimary,
            userId: assetData.userId,
            workspaceId: user.currentWorkspace,
          }),
        }
      );

      return {
        ...response,
        assetId: assetData.assetId,
        userId: assetData.userId,
        isPrimary: assetData.isPrimary,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const assetSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addAsset.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(addAsset.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) =>
            item._id === action.payload._id ||
            (item.isPrimary &&
              action.payload.isPrimary &&
              item.userId === action.payload.userId)
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => {
          if (action.payload.isPrimary) {
            return !(item.isPrimary && item.userId === action.payload.userId);
          } else {
            return item._id !== action.payload.assetId;
          }
        });
      });
  },
});

export default assetSlice.reducer;
