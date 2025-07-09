import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";
import { USER_ROLE } from "../utility/utility";
import { themes } from "../utility/themes";
import { add } from "date-fns";

export const getUserInfo = createAsyncThunk(
  "user-actions/getUserInfo",
  ({ userId }) => {
    return FetchApi.fetch(
      `${config.api}/api/user/user-actions/read/${userId}`,
      {
        method: "GET",
      }
    );
  }
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  ({ userId, oldPassword, password }) => {
    return FetchApi.fetch(
      `${config.api}/api/profile/change-password/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, oldPassword }),
      }
    );
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (updates) => {
    return FetchApi.fetch(`${config.api}/api/profile/update-profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
  }
);

export const changeTheme = createAsyncThunk(
  "user/changeTheme",
  async ({ themeId }) => {
    return FetchApi.fetch(`${config.api}/api/profile/changeTheme`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ themeId }),
    });
  }
);

const initialState = {
  profile: null,
  shouldDisplayBirthdayNotification: true,
};

const profileSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setMe(state, { payload }) {
      state.profile = payload.user;
    },
    changeUserWorkspace(state, { payload }) {
      state.profile.currentWorkspace = payload.workspaceId;
    },
    disableShouldDisplayBirthdayNotification(state, payload) {
      state.shouldDisplayBirthdayNotification = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateProfile.fulfilled, (state, { payload }) => {
      // Support both legacy and extended update responses
      if (payload.user) {
        // Legacy minimal update
        if (payload.user.name !== undefined) {
          state.profile.name = payload.user.name;
        }
        if (payload.user.dateOfBirth !== undefined) {
          state.profile.dateOfBirth = payload.user.dateOfBirth;
        }
      }
      if (payload.user) {
        // Extended update: update only changed fields
        const updatedFields = payload.updatedFields || {};
        Object.keys(updatedFields).forEach((key) => {
          // For nested fields, handle accordingly
          if (typeof updatedFields[key] === 'object' && updatedFields[key] !== null && !Array.isArray(updatedFields[key])) {
            state.profile[key] = {
              ...state.profile[key],
              ...updatedFields[key],
            };
          } else {
            state.profile[key] = updatedFields[key];
          }
        });
      }
    });
    builder.addCase(changeTheme.fulfilled, (state, { payload }) => {
      const { _id: userId, workspaceThemes } = payload;
      if (state.profile._id === userId)
        state.profile.workspaceThemes = workspaceThemes;
    });
    builder.addCase(getUserInfo.fulfilled, (state, { payload }) => {
      state.profile = payload.user;
    });
  },
});

const selectMe = (state) => state.user.profile;
const selectUserRole = (state) => {
  if (state.user.profile === null) return null;

  const userRoles = state.user.profile?.roles;
  const currentWorkspaceId = state.user.profile?.currentWorkspace;
  const isWorkspaceAdmin = userRoles?.[currentWorkspaceId]?.includes(
    USER_ROLE.ADMIN
  );

  return isWorkspaceAdmin;
};

const selectCurrentWorkspace = (state) => state.user.profile?.currentWorkspace;
const selectCurrentTheme = (state) => {
  const profile = state.user.profile;
  if (!profile || !profile.workspaceThemes || !profile.currentWorkspace) {
    return null;
  }

  const themeId = profile.workspaceThemes[profile.currentWorkspace];
  return themes.find((theme) => theme.themeId === themeId);
};
const selectShouldDisplayBirthdayNotification = (state) =>
  state.user.shouldDisplayBirthdayNotification;
const { setMe, changeUserWorkspace, disableShouldDisplayBirthdayNotification } =
  profileSlice.actions;

export {
  changeUserWorkspace,
  disableShouldDisplayBirthdayNotification,
  selectShouldDisplayBirthdayNotification,
  selectMe,
  setMe,
  selectUserRole,
  selectCurrentWorkspace,
  selectCurrentTheme,
};
export default profileSlice.reducer;
