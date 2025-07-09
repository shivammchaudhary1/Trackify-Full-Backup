import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";
import { themes } from "##/src/utility/themes.js";
import { createSelector } from "@reduxjs/toolkit";

//Admin Route: Enable or Disable Timer edit option
const editTimer = createAsyncThunk(
  "workspace/editTimer",
  ({ workspace, isEditable }) => {
    return FetchApi.fetch(
      `${config.api}/api/workspace/edittimer?workspace=${workspace}&isEditable=${isEditable}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isEditable }),
      }
    );
  }
);

// Admin Route: Create new workspace
const createWorkspace = createAsyncThunk(
  "workspace/createWorkspace",
  ({ userId, name, timeZone }) => {
    return FetchApi.fetch(`${config.api}/api/workspace/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        name,
        themeId: themes[0].themeId,
        timeZone,
      }),
    });
  }
);

// Admin Route: Update workspace name
const updateWorkspace = createAsyncThunk(
  "workspace/updateWorkspace",
  ({ workspaceId, name, settings, timeZone }) => {
    return FetchApi.fetch(
      `${config.api}/api/workspace/workspace-actions/update/${workspaceId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, settings, timeZone }),
      }
    );
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
export const deleteWorkspace = createAsyncThunk(
  "workspace/deleteWorkspace",
  ({ workspaceId }) => {
    return FetchApi.fetch(
      `${config.api}/api/workspace/workspace-actions/delete/${workspaceId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
);
const initialState = {
  workspaces: [],
  selectedWorkspace: null,
  isWorkspaceAdmin: false,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    changeWorkspace(state, { payload }) {
      state.selectedWorkspace = payload.workspace;
      state.isWorkspaceAdmin = payload.isWorkspaceAdmin;
    },
    setWorkspaces(state, { payload }) {
      state.workspaces = payload.workspaces;
    },
    setUpdateUserRole(state, { payload }) {
      state.workspaces = state.workspaces.map((workspace) => {
        if (workspace._id === payload.workspaceId) {
          workspace.users = state.selectedWorkspace.users.map((user) => {
            if (user.user === payload.userId) {
              return { user: payload.userId, isAdmin: payload.updatedRole };
            } else {
              return user;
            }
          });
          return workspace;
        } else {
          return workspace;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createWorkspace.fulfilled, (state, { payload }) => {
        state.workspaces.push(payload);
      })
      .addCase(editTimer.fulfilled, (state, { payload }) => {
        const { updatedWorkspace } = payload;
        state.workspaces.forEach((workspace, index) => {
          if (workspace._id === updatedWorkspace._id) {
            state.workspaces[index].isEditable = updatedWorkspace.isEditable;
          }
        });
      })
      .addCase(updateWorkspace.fulfilled, (state, { payload }) => {
        state.workspaces = state.workspaces.map((workspace) => {
          if (workspace._id === payload.updatedWorkspace._id) {
            return payload.updatedWorkspace;
          } else {
            return workspace;
          }
        });
      })
      .addCase(changeUserRole.fulfilled, (state, { payload }) => {
        const { userId, workspaceId, isAdmin } = payload;
        state.workspaces = state.workspaces.map((workspace) => {
          if (workspace._id === workspaceId) {
            // Find the index of the user to be updated
            const userIndex = workspace.users.findIndex(
              (usersData) => usersData.user === userId
            );
            // Update the isAdmin property if the user exists
            if (userIndex !== -1) {
              workspace.users[userIndex].isAdmin = isAdmin;
            }
            return workspace;
          } else {
            return workspace;
          }
        });
      })
      .addCase(deleteWorkspace.fulfilled, (state, { payload }) => {
        const workspaceId = payload.workspaceDeleted._id;
        state.workspaces = state.workspaces.filter(
          (workspace) => workspace._id !== workspaceId
        );
      });
  },
});

const { changeWorkspace, setWorkspaces, setUpdateUserRole } =
  workspaceSlice.actions;
const selectWorkspace = (state) => state.workspace;
const selectCurrentTheme = (state) => state.workspace.selectWorkspace?.theme;
const selectUserRole = (state) => state.workspace.isWorkspaceAdmin;

const selectWorkspaces = (state) => state.workspace.workspaces;

const makeSelectWorkspace = (selectorOptions = {}) =>
  createSelector(
    [selectWorkspaces, (state, workspaceId) => workspaceId],
    (workspaces, workspaceId) =>
      workspaces?.find((workspace) => workspace._id === workspaceId),
    selectorOptions
  );

export {
  createWorkspace,
  changeWorkspace,
  editTimer,
  updateWorkspace,
  setWorkspaces,
  setUpdateUserRole,
  selectCurrentTheme,
  selectUserRole,
  selectWorkspace,
  selectWorkspaces,
  makeSelectWorkspace,
};

export default workspaceSlice.reducer;
