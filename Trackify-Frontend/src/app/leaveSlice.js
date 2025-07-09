import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";

// All leave data presnet in database
const getLeaveDetails = createAsyncThunk(
  "leave/getLeaveDetails",
  async ({ userId }, thunkAPI) => {
    try {
      const response = await FetchApi.fetch(
        `${config.api}/api/leave/getallleaves/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.leaves;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const updateStatusOfLeave = createAsyncThunk(
  "leave/updateStatusOfLeave",
  async ({ leaveId, status, rejectionReason, workspaceId }, thunkAPI) => {
    try {
      const response = await FetchApi.fetch(
        `${config.api}/api/leave/updatestatus`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leaveId,
            status,
            rejectionReason,
            workspaceId,
          }),
        }
      );

      return response.leaveDetails;
    } catch (error) {
      thunkAPI.rejectWithValue(error.message);
    }
  }
);

// getting user's all leave Data
const getUsersLeave = createAsyncThunk(
  "leave/getUsersLeave",
  async ({ userId }, thunkAPI) => {
    try {
      const response = await FetchApi.fetch(
        `${config.api}/api/leave/getleaves/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.userLeaveData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const getUsersLeaveBalance = createAsyncThunk(
  "leave/getUsersLeaveBalance",
  async ({ userId, workspaceId }, thunkAPI) => {
    try {
      const response = await FetchApi.fetch(
        `${config.api}/api/leave/getuserleavebalance/${userId}/${workspaceId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // const data = await response.json();
      return response.leaveBalance;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const applyLeave = createAsyncThunk(
  "leave/applyLeave",
  async (
    {
      title,
      type,
      startDate,
      endDate,
      userId,
      dailyDetails,
      numberOfDays,
      description,
    },
    thunkAPI
  ) => {
    try {
      await FetchApi.fetch(`${config.api}/api/leave/createleave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          type,
          startDate,
          endDate,
          userId,
          dailyDetails,
          numberOfDays,
          description,
        }),
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const deleteLeaveRequest = createAsyncThunk(
  "leave/deleteLeaveRequest",
  async ({ userId, leaveId }, thunkAPI) => {
    try {
      const response = await FetchApi.fetch(
        `${config.api}/api/leave/deleteleave`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            leaveId,
          }),
        }
      );
      return { leaveId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/*
 * Leave Auto add setting actions starts here
 */

// 1. Create new Setting
const createNewAutoAddLeaveBalanceSetting = createAsyncThunk(
  "leaveAutoAddSetting/create",
  async (
    { date, frequency, nextExecutionDate, numberOfLeaves, recurrence, type },
    thunkAPI
  ) => {
    return FetchApi.fetch(`${config.api}/api/leave-autoadd/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        frequency,
        nextExecutionDate,
        numberOfLeaves,
        recurrence,
        type,
      }),
    });
  }
);

// 2. Update setting
const updateAutoAddLeaveBalanceSetting = createAsyncThunk(
  "leaveAutoAddSetting/update",
  async (
    {
      type,
      frequency,
      date,
      numberOfLeaves,
      settingId,
      recurrence,
      nextExecutionDate,
    },
    thunkAPI
  ) => {
    return FetchApi.fetch(
      `${config.api}/api/leave-autoadd/update/${settingId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          frequency,
          date,
          numberOfLeaves,
          recurrence,
          nextExecutionDate,
        }),
      }
    );
  }
);

// 3. Get all settings
const getAllAutoAddLeaveBalanceSettings = createAsyncThunk(
  "leaveAutoAddSetting/get-all",
  async (_, thunkAPI) => {
    try {
      return FetchApi.fetch(`${config.api}/api/leave-autoadd/get-all`, {
        method: "GET",
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// 4. Delete setting
const deleteAutoAddLeaveBalanceSetting = createAsyncThunk(
  "leaveAutoAddSetting/delete",
  async ({ settingId }, thunkAPI) => {
    return FetchApi.fetch(
      `${config.api}/api/leave-autoadd/delete/${settingId}`,
      {
        method: "DELETE",
      }
    );
  }
);

// 5. enable setting
const enableAutoAddLeaveBalanceSetting = createAsyncThunk(
  "leaveAutoAddSetting/enable",
  async ({ settingId }, thunkAPI) => {
    return FetchApi.fetch(
      `${config.api}/api/leave-autoadd/enable/${settingId}`,
      {
        method: "PATCH",
      }
    );
  }
);

// 6. disable setting
const disableAutoAddLeaveBalanceSetting = createAsyncThunk(
  "leaveAutoAddSetting/disable",
  async ({ settingId }, thunkAPI) => {
    return FetchApi.fetch(
      `${config.api}/api/leave-autoadd/disable/${settingId}`,
      {
        method: "PATCH",
      }
    );
  }
);

// Retrieve all history logs
const retrieveLeaveHistoryData = createAsyncThunk(
  "leaveHistory/get-all",
  async ({ workspaceId }, thunkAPI) => {
    return FetchApi.fetch(
      `${config.api}/api/leave-history/get-all/${workspaceId}`,
      {
        method: "GET",
      }
    );
  }
);

/*
 * Leave Auto add setting actions ends here
 */

const initialState = {
  //all leaves data
  leaveData: [],
  userLeaveData: [],
  userLeaveBalance: [],
  leaveAutoAddSettings: [],
  historyLogData: [],
};

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getLeaveDetails.fulfilled, (state, action) => {
      state.leaveData = action.payload;
    });
    builder.addCase(updateStatusOfLeave.fulfilled, (state, action) => {
      state.leaveData = state.leaveData.map((leave) => {
        if (leave._id === action.payload._id) {
          return action.payload;
        } else {
          return leave;
        }
      });
    });
    builder.addCase(getUsersLeave.fulfilled, (state, action) => {
      state.userLeaveData = action.payload;
    });
    builder.addCase(getUsersLeaveBalance.fulfilled, (state, action) => {
      state.userLeaveBalance = action.payload;
    });
    builder.addCase(applyLeave.fulfilled, (state, action) => {});
    builder.addCase(deleteLeaveRequest.fulfilled, (state, action) => {
      state.userLeaveData = state.userLeaveData.filter(
        (leave) => leave._id !== action.payload.leaveId
      );
    });
    builder.addCase(
      createNewAutoAddLeaveBalanceSetting.fulfilled,
      (state, { payload: { newSetting } }) => {
        state.leaveAutoAddSettings = [
          ...state.leaveAutoAddSettings,
          newSetting,
        ];
      }
    );
    builder.addCase(
      getAllAutoAddLeaveBalanceSettings.fulfilled,
      (state, { payload: { leaveSettings } }) => {
        state.leaveAutoAddSettings = leaveSettings;
      }
    );
    builder.addCase(
      deleteAutoAddLeaveBalanceSetting.fulfilled,
      (state, { payload: { deletedSettingId } }) => {
        state.leaveAutoAddSettings = [...state.leaveAutoAddSettings].filter(
          (setting) => setting._id !== deletedSettingId
        );
      }
    );
    builder.addCase(
      updateAutoAddLeaveBalanceSetting.fulfilled,
      (state, { payload: { updatedSetting } }) => {
        state.leaveAutoAddSettings = [...state.leaveAutoAddSettings].map(
          (setting) => {
            if (setting._id === updatedSetting._id) {
              return updatedSetting;
            }
            return setting;
          }
        );
      }
    );
    builder.addCase(
      enableAutoAddLeaveBalanceSetting.fulfilled,
      (state, { payload: { updatedSetting } }) => {
        state.leaveAutoAddSettings = [...state.leaveAutoAddSettings].map(
          (setting) => {
            if (setting._id === updatedSetting._id) {
              setting.enabled = updatedSetting.enabled;
              return setting;
            }
            return setting;
          }
        );
      }
    );
    builder.addCase(
      disableAutoAddLeaveBalanceSetting.fulfilled,
      (state, { payload: { updatedSetting } }) => {
        state.leaveAutoAddSettings = [...state.leaveAutoAddSettings].map(
          (setting) => {
            if (setting._id === updatedSetting._id) {
              setting.enabled = updatedSetting.enabled;
              return setting;
            }
            return setting;
          }
        );
      }
    );
    builder.addCase(
      retrieveLeaveHistoryData.fulfilled,
      (state, { payload }) => {
        state.historyLogData = payload.LeaveHistories;
      }
    );
  },
});

const selectLeaveData = (state) => state.leave.leaveData;
const selectUserLeaveData = (state) => state.leave.userLeaveData;
const selectUserLeaveBalance = (state) => state.leave.userLeaveBalance;

const selectLeaveAutoAddSettings = (state) => state.leave.leaveAutoAddSettings;
const selectLeaveHistoryLogs = (state) => state.leave.historyLogData;

export default leaveSlice.reducer;
export {
  getLeaveDetails,
  updateStatusOfLeave,
  getUsersLeave,
  getUsersLeaveBalance,
  applyLeave,
  deleteLeaveRequest,
  selectLeaveData,
  selectUserLeaveData,
  selectUserLeaveBalance,

  // Leave Auto add setting actions
  createNewAutoAddLeaveBalanceSetting,
  updateAutoAddLeaveBalanceSetting,
  getAllAutoAddLeaveBalanceSettings,
  deleteAutoAddLeaveBalanceSetting,
  enableAutoAddLeaveBalanceSetting,
  disableAutoAddLeaveBalanceSetting,
  selectLeaveAutoAddSettings,
  retrieveLeaveHistoryData,
  selectLeaveHistoryLogs,
};