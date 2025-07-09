import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";

const initialState = {
  teams: [],
};

export const getTeams = createAsyncThunk("team/getTeams", async (projectId) => {
  const response = await FetchApi.fetch(`${config.api}/api/projects/team/${projectId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.users;
});

export const removeTeamMember = createAsyncThunk(
  "team/removeTeamMembers",
  async ({ projectId, userId }) => {
    const response = await FetchApi.fetch(
      `${config.api}/api/projects/removemember/${projectId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      },
    );
    return response.success;
  },
);

// You can create other async thunks for addTeam, deleteTeam, and updateTeam if needed.

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTeams.fulfilled, (state, action) => {
        state.teams = action.payload;
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.teams = state.teams.filter(
          (teamMember) => teamMember.id !== action.payload,
        );
      });
  },
});

export default teamSlice.reducer;

export const selectTeams = (state) => state.team.teams;
