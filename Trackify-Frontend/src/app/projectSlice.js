import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";

// get all the projects for workspaces
const getProjects = createAsyncThunk(
  "project/getProjects",
  () => {
    return FetchApi.fetch(`${config.api}/api/projects/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
);

const updateProject = createAsyncThunk(
  "project/updateProject",
  ({
    projectId,
    name,
    description,
    toggleIsComplete,
    estimatedHours,
    clientId,
    selectedUsers,
    isProjectCompleted,
    timeSpend,
  }) => {
    return FetchApi.fetch(`${config.api}/api/projects/update/${projectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        estimatedHours,
        toggleIsComplete,
        isProjectCompleted,
        clientId,
        selectedUsers,
        timeSpend,
      }),
    });
  }
);

const addProject = createAsyncThunk(
  "project/addProject",
  ({ data }) => {
    return FetchApi.fetch(
      `${config.api}/api/projects/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
            
        },
        body: JSON.stringify(data),
      },
    );
  },
);

const deleteProject = createAsyncThunk(
  "project/deleteProject",
  async ({ projectId }) => {
    await FetchApi.fetch(`${config.api}/api/projects/delete/${projectId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
          
      },
    });
    return { projectId };
  },
);

const initialState = {
  projects: [],
};
const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjects: (state, {payload}) => {
      state.projects = payload.projects;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.fulfilled, (state, { payload }) => {
        state.projects = payload.projects;
      })
      .addCase(updateProject.fulfilled, (state, { payload }) => {
        state.projects = state.projects.map((project) => {
          if (project._id === payload.project._id) {
            return payload.project;
          } else {
            return project;
          }
        });
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.projects.push(action.payload.project);
      })
      .addCase(deleteProject.fulfilled, (state, { payload }) => {
        state.projects = state.projects.filter(
          (project) => project._id !== payload.projectId,
        );
      });
  },
});

export default projectSlice.reducer;

const { setProjects } = projectSlice.actions;
const selectProjects = (state) => state.project.projects;

export {
  getProjects,
  addProject,
  deleteProject,
  updateProject,
  selectProjects,
  setProjects,
};
