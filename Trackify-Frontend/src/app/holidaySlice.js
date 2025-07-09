import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";

const initialState = {
  holiday: [],
  holidayTypes: [],
  leaveBalances: [],
};

export const getHoliday = createAsyncThunk("holiday/getHoliday", () => {
  return FetchApi.fetch(`${config.api}/api/holiday/get-user-holidays`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
});

export const requestHoliday = createAsyncThunk(
  "holiday/requestHoliday",
  ({ title, date, description, workspaceId, type, userId }) => {
    return FetchApi.fetch(`${config.api}/api/holiday/requestholiday`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        date,
        description,
        workspaceId,
        type,
        userId,
      }),
    });
  }
);

export const updateHoliday = createAsyncThunk(
  "holiday/updateHoliday",
  ({ holidayId, title, date, description, type }) => {
    return FetchApi.fetch(`${config.api}/api/holiday/updateholiday`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        holidayId,
        title,
        date,
        description,
        type,
      }),
    });
  }
);

export const deleteHoliday = createAsyncThunk(
  "holiday/deleteHoliday",
  ({ userId, holidayId }) => {
    return FetchApi.fetch(`${config.api}/api/holiday/deleteholiday/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        holidayId,
      }),
    });
  }
);

export const getHolidayTypes = createAsyncThunk(
  "holiday/getHolidayTypes",
  ({ userId }) => {
    return FetchApi.fetch(`${config.api}/api/holiday/getleavetypes/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
);

export const addLeaveType = createAsyncThunk(
  "holiday/addLeaveType",
  async ({ userId, leaveType, leaveTitle }) => {
    const response = await FetchApi.fetch(
      `${config.api}/api/holiday/addleavetype`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          leaveType,
          title: leaveTitle,
        }),
      }
    );
    return response.user.leaveTypes;
  }
);

export const updateLeaveType = createAsyncThunk(
  "holiday/updateLeaveType",
  async ({ userId, oldLeaveType, newLeaveType, paid, isActive, title }) => {
    const response = await FetchApi.fetch(
      `${config.api}/api/holiday/updateleavetype`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          oldLeaveType,
          newLeaveType,
          paid,
          isActive,
          title,
        }),
      }
    );

    return response.data.user.leaveTypes;
  }
);

export const deleteLeaveType = createAsyncThunk(
  "holiday/deleteLeaveType",
  async ({ userId, leaveType }) => {
    await FetchApi.fetch(`${config.api}/api/holiday/deleteleavetype`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        leaveType,
      }),
    });
    return { leaveType };
  },
);

export const getLeaveBalances = createAsyncThunk(
  "holiday/getLeaveBalances",
  async ({ workspaceId }, thunkAPI) => {
    try {
      const response = await FetchApi.fetch(
        `${config.api}/api/holiday/getleavebalances/${workspaceId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.leaveBalances;
    } catch (error) {
      thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const updateLeaveBalance = createAsyncThunk(
  "holiday/updateLeaveBalance",
  async ({ userId, workspaceId, leaveType, amount }) => {
    const response = await FetchApi.fetch(
      `${config.api}/api/holiday/updateleavebalance`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          workspaceId,
          leaveType,
          amount,
        }),
      },
    );

    return response.leaveBalance;
  },
);

export const updateLeaveBalanceForAllUsers = createAsyncThunk(
  "holiday/updateLeaveBalanceForAllUsers",
  async ({ workspaceId, leaveType, amount }) => {
    const response = await FetchApi.fetch(
      `${config.api}/api/holiday/updateleavebalancetoallusers`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          leaveType,
          amount,
        }),
      },
    );
    return response.leaveBalances;
  },
);

const holidaySlice = createSlice({
  name: "holiday",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getHoliday.fulfilled, (state, { payload }) => {
      state.holiday = [...payload.userHoliday, ...payload.workspaceHoliday];
    });
    builder.addCase(requestHoliday.fulfilled, (state, action) => {
      state.holiday.push(action.payload.newHoliday);
    });
    builder.addCase(updateHoliday.fulfilled, (state, action) => {
      state.holiday = state.holiday.map((holiday) =>
        holiday._id === action.payload.holiday._id
          ? action.payload.holiday
          : holiday,
      );
    });
    builder.addCase(deleteHoliday.fulfilled, (state, action) => {
      state.holiday = state.holiday.filter(
        (holiday) => holiday._id !== action.payload.holidayId,
      );
    });
    builder.addCase(getHolidayTypes.fulfilled, (state, action) => {
      state.holidayTypes = [...action.payload.leaveTypes];
    });
    builder.addCase(addLeaveType.fulfilled, (state, action) => {
      state.holidayTypes = action.payload;
    });
    builder.addCase(updateLeaveType.fulfilled, (state, action) => {
      state.holidayTypes = action.payload;
    });
    builder.addCase(deleteLeaveType.fulfilled, (state, action) => {
      state.holidayTypes = state.holidayTypes.filter(
        (leaveType) => leaveType.leaveType !== action.payload.leaveType,
      );
    });
    builder.addCase(getLeaveBalances.fulfilled, (state, action) => {
      state.leaveBalances = action.payload;
    });
    builder.addCase(updateLeaveBalance.fulfilled, (state, action) => {
      for (let i = 0; i < state.leaveBalances.length; i++) {
        if (state.leaveBalances[i]._id === action.payload._id) {
          state.leaveBalances[i].leaveBalance = action.payload.leaveBalance;
        }
      }
    });
    builder.addCase(
      updateLeaveBalanceForAllUsers.fulfilled,
      (state, action) => {
        state.leaveBalances = action.payload;
      },
    );
  },
});

export default holidaySlice.reducer;

export const selectHolidays = (state) => state.holiday.holiday;
export const selectHolidayTypes = (state) => state.holiday.holidayTypes;
export const selectLeaveBalances = (state) => state.holiday.leaveBalances;
