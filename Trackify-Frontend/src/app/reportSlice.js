import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";
import { createSelector } from "@reduxjs/toolkit";

const getReport = createAsyncThunk(
  "report/getReport",
  async (
    { startDate, endDate, clients, projects, users },
    { rejectWithValue }
  ) => {
    try {
      const response = await FetchApi.fetch(
        `${config.api}/api/reports/userreport?startDate=${startDate}&endDate=${endDate}&clients=${clients}&projects=${projects}&users=${users}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const monthlyReport = createAsyncThunk(
  "report/monthlyReport",
  ({ month, year, workspaceId }) => {
    return FetchApi.fetch(
      `${config.api}/api/reports/monthlyreport/${workspaceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month,
          year,
        }),
      }
    );
  }
);

export const savingMonthlyReport = createAsyncThunk(
  "report/savingMonthlyReport",
  async ({ userId, workspaceId, month, year, monthlyReportData }, thunkAPI) => {
    try {
      const response = await FetchApi.fetch(
        `${config.api}/api/reports/savingmonthlyreport/${userId}/${workspaceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ month, year, monthlyReportData }),
        }
      );
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const detailedAdminReport = createAsyncThunk(
  "report/detailedAdminReport",
  async (
    { startDate, endDate, userIds, projectIds, start, end, selectIsBillable },
    { rejectWithValue }
  ) => {
    try {
      const response = await FetchApi.fetch(
        `${config.api}/api/reports/admin-report?startDate=${startDate}&endDate=${endDate}&userIds=${userIds}&projectIds=${projectIds}&start=${start}&end=${end}&selectIsBillable=${selectIsBillable}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  allReports: [],
  tempDateReports: [],
  isRequestMade: false,
  monthlyReport: [],
  isMonthlyReportExist: false,
  monthlyReportList: [],
  userReport: [],
  adminReport: {},
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    requestMade(state) {
      state.isRequestMade = false;
    },
    resetDate(state) {
      state.tempDateReports = [];
    },
    setUpdateMonthlyReportData(state, { payload }) {
      state.monthlyReport.userMonthlyHours = payload.userMonthlyHours;
    },
    setUserReport(state, { payload }) {
      state.userReport = payload;
    },
    setAdminReport(state, { payload }) {
      state.adminReport = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getReport.fulfilled, (state, { payload }) => {
      state.allReports = payload.projects;
    });
    builder.addCase(monthlyReport.fulfilled, (state, { payload }) => {
      state.monthlyReport = payload.monthlyReport;
      state.isMonthlyReportExist = !payload.disableSaving;
    });

    builder.addCase(detailedAdminReport.fulfilled, (state, { payload }) => {
      state.adminReport = payload;
    });
    builder.addCase(savingMonthlyReport.fulfilled, (state, { payload }) => {
      state.isMonthlyReportExist = false;
    });
  },
});

const {
  setAdminReport,
  requestMade,
  resetDate,
  setUpdateMonthlyReportData,
  setUserReport,
} = reportSlice.actions;

const selectReport = (state) => state.report;
const selectMonthlyReport = (state) => state.report.monthlyReport;
const selectShouldSaveMonthlyReport = (state) =>
  state.report.isMonthlyReportExist;
const selectUserReport = (state) => state.report.userReport;
const selectMonthlyReportList = (state) => state.report.monthlyReportList;

const selectAdminDetailedReport = (state) => state.report;
const makeSelectAdminDetailedReport = createSelector(
  [selectAdminDetailedReport],
  (report) => report.adminReport
);

export {
  getReport,
  setAdminReport,
  setUserReport,
  selectReport,
  requestMade,
  resetDate,
  selectMonthlyReport,
  setUpdateMonthlyReportData,
  selectUserReport,
  selectAdminDetailedReport,
  selectMonthlyReportList,
  selectShouldSaveMonthlyReport,
  makeSelectAdminDetailedReport,
};
export default reportSlice.reducer;
