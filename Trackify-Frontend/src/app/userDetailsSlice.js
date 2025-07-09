import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";
import { themes } from "##/src/utility/themes.js";

//Admin Route: Fetch all the user who belongs to current workspace
const getWorkspaceUsers = createAsyncThunk(
  "userDetails/getUserDetails",
  () => {
    return FetchApi.fetch(
      `${config.api}/api/user/users/all`,
      {
        method: "GET",
      },
    );
  },
);

// Admin Route: Change user's role
const changeUserStatus = createAsyncThunk(
  "userDetails/changeStatus",
  ({ userId, status }) => {
    return FetchApi.fetch(`${config.api}/api/user/user-actions/change-status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, status }),
    });
  }
);

// Admin Route: Change user's role
const changeUserRole = createAsyncThunk(
  "userDetails/changeUserRole",
  ({ userId, isAdmin }) => {
    return FetchApi.fetch(`${config.api}/api/user/user-actions/change-role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, role: isAdmin }),
    });
  }
);

// Admin Route: Invite user in current workspace
const inviteUser = createAsyncThunk(
  "userDetails/inviteUser",
  ({ email, workspaceId }) => {
    return FetchApi.fetch(`${config.api}/api/user/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, workspaceId, themeId: themes[0].themeId }),
    });
  }
);

// Admin Route: Remove user from workspace
export const removeUser = createAsyncThunk(
  "userDetails/removeUser",
  async ({ userId, workspaceId }) => {
    await FetchApi.fetch(
      `${config.api}/api/user/deleteuserfromworkspace/${workspaceId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );
    return { userId };
  }
);

export const checkEmail = createAsyncThunk("user/emailExist", (payload) => {
  return FetchApi.fetch(`${config.api}/api/user/isExist/${payload.email}`);
});

// Create a new password for user
export const createPass = createAsyncThunk(
  "user/createPass",
  ({ token, userId, password, confirmPassword }) => {
    return FetchApi.fetch(
      `${config.api}/api/profile/forget-password/${userId}/${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, confirmPassword }),
      }
    );
  }
);

const initialState = {
  userDetails: [],
  emailExist: true,
  mailSent: false,
  passChangeMessage: "",
  passChanged: false,
};

const userDetailsSlice = createSlice({
  name: "userDetails",
  initialState,
  reducers: {
    setUsers: (state, { payload }) => {
      state.userDetails = payload.users;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWorkspaceUsers.fulfilled, (state, { payload }) => {
      state.userDetails = payload.users;
    });
    builder.addCase(removeUser.fulfilled, (state, { payload }) => {
      state.userDetails = state.userDetails.filter(
        (user) => user._id !== payload.userId
      );
    });
    builder.addCase(changeUserStatus.fulfilled, (state, { payload }) => {
      state.userDetails = state.userDetails.map((user) => {
        if (user?._id === payload.userId) {
          user.statuses = payload.statuses;
        }
        return user;
      });
    });
    builder.addCase(changeUserRole.fulfilled, (state, { payload }) => {
      state.userDetails = state.userDetails.map((user) => {
        if (user?._id === payload.userId) {
          user.roles = payload.roles;
        }
        return user;
      });
    });
  },
});

export default userDetailsSlice.reducer;

const { setUsers } = userDetailsSlice.actions;
const selectUserDetails = (state) => state.userDetails.userDetails;

export {
  changeUserStatus,
  getWorkspaceUsers,
  inviteUser,
  setUsers,
  changeUserRole,
  selectUserDetails,
};
