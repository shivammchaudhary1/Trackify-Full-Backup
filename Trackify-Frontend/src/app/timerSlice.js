import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";
import { calculateTotalTime, formatTime } from "##/src/utility/timer.js";
import { createSelector } from "@reduxjs/toolkit";

const startTimer = createAsyncThunk(
  "timer/startTimer",
  ({ projectId, title, userId }) => {
    return FetchApi.fetch(`${config.api}/api/timer/timer-actions/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectId, title, userId }),
    });
  }
);

const stopTimer = createAsyncThunk(
  "timer/stopTimer",
  ({ projectId, title }) => {
    return FetchApi.fetch(`${config.api}/api/timer/timer-actions/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectId, title }),
    });
  }
);

const resumeTimer = createAsyncThunk("timer/resumeTimer", ({ entryId }) => {
  return FetchApi.fetch(`${config.api}/api/timer/timer-actions/resume`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ entryId }),
  });
});

const deleteEntry = createAsyncThunk(
  "timer/deleteEntry",
  async ({ entryId }) => {
    return FetchApi.fetch(
      `${config.api}/api/user/entry/delete?entryId=${entryId}`,
      {
        method: "DELETE",
      }
    );
  }
);

const updateEntry = createAsyncThunk("timer/updateEntry", async ({ entry }) => {
  return FetchApi.fetch(`${config.api}/api/user/entry/edit/${entry._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ entry }),
  });
});

const updateEntryTitle = createAsyncThunk(
  "timer/updateEntryTitle",
  ({ entry }) => {
    return FetchApi.fetch(`${config.api}/api/user/entry/title`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entry }),
    });
  }
);

const addManualEntry = createAsyncThunk(
  "timer/addManualEntry",
  ({ newEntry }) => {
    return FetchApi.fetch(
      `${config.api}/api/timer/timer-actions/manualEntry/${newEntry.userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newEntry }),
      }
    );
  }
);

export const getMoreEntries = createAsyncThunk(
  "timer/getMoreEntries",
  ({ lastEntry }) => {
    return FetchApi.fetch(
      `${config.api}/api/timer/entries/get-entries/${lastEntry}`,
      {
        method: "GET",
      }
    );
  }
);
export const markEntryAsBillableNonBillable = createAsyncThunk(
  "billable/nonBillable",
  async ({ entryId, isBillable }) => {
    return await FetchApi.fetch(
      `${config.api}/api/timer/entries/billable/nonBillable/${entryId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isBillable }),
      }
    );
  }
);

export const markEntryAsBulkIsBillableNonBillable = createAsyncThunk(
  "entries/bulkUpdateIsBillable",
  async (updateData) => {
    return await FetchApi.fetch(
      `${config.api}/api/timer/entries/billable/bulk-update`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );
  }
);

const initialState = {
  runningTimer: {
    startTime: { hours: 0, minutes: 0, seconds: 0 },
    title: "",
    isRunning: false,
    currentLog: null,
    projectId: "",
  },
  startTime: { hours: 0, minutes: 0, seconds: 0 },
  option: null,
  text: "",
  entries: [],
  lastEntryDate: "",
  timer: null,
  entryDay: 0,
  loading: {
    billable: false,
    bulkBillable: false,
  },
};

const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    inputTextChange(state, { payload }) {
      state.runningTimer.title = payload.text;
    },
    setProjectChangeInTimer(state, { payload }) {
      state.runningTimer.projectId = payload.option;
    },
    setEntries(state, { payload }) {
      state.entries = payload.entries;
      state.lastEntryDate = payload.lastEntryDate;
    },
    setEntryDay(state, { payload }) {
      state.entryDay = payload.day;
    },
    setRunningTimer(state, { payload }) {
      const formattedStartTime = calculateTotalTime(
        payload.startTime,
        payload.duration
      );

      const currentRunningTimer = {
        ...payload,
        startTime: {
          hours: formattedStartTime.hours,
          minutes: formattedStartTime.minutes,
          seconds: formattedStartTime.seconds,
        },
      };
      state.runningTimer = currentRunningTimer;
    },
    updateRunningTimer(state, { payload }) {
      state.runningTimer.startTime = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(stopTimer.fulfilled, (state, { payload }) => {
        const {
          updatedTimer: { isRunning, currentLog },
          updatedEntry,
        } = payload;

        state.runningTimer = {
          ...state.runningTimer,
          startTime: { hours: 0, minutes: 0, seconds: 0 },
          isRunning,
          currentLog,
          title: "",
          projectId: "null",
          entryId: "",
        };

        state.entries = state.entries.map((entry) => {
          if (entry._id === updatedEntry._id) {
            return updatedEntry;
          }
          return entry;
        });
      })
      .addCase(startTimer.fulfilled, (state, { payload }) => {
        const { isRunning, newEntry } = payload;

        const timeCalculation = calculateTotalTime(
          newEntry.startTime,
          newEntry.durationInSeconds
        );

        state.runningTimer = {
          ...state.runningTimer,
          entryId: newEntry._id,
          isRunning,
          title: newEntry.title,
          projectId: newEntry.project._id,
          startTime: {
            hours: timeCalculation.hours,
            minutes: timeCalculation.minutes,
            seconds: timeCalculation.seconds,
          },
        };
        state.entries = [...state.entries, newEntry];
      })
      .addCase(deleteEntry.fulfilled, (state, { payload }) => {
        state.entries = state.entries.filter(
          (entry) => entry._id != payload.entryId
        );
      })
      .addCase(resumeTimer.fulfilled, (state, { payload }) => {
        const { updatedEntry } = payload;

        const timeCalculation = calculateTotalTime(
          updatedEntry.startTime,
          updatedEntry.durationInSeconds
        );

        state.runningTimer = {
          ...state.runningTimer,
          isRunning: true,
          title: updatedEntry.title,
          entryId: updatedEntry._id,
          projectId: updatedEntry.project._id,
          startTime: {
            hours: timeCalculation.hours,
            minutes: timeCalculation.minutes,
            seconds: timeCalculation.seconds,
          },
        };

        state.entries = state.entries.map((entry) => {
          if (entry._id === updatedEntry._id) updatedEntry;
          return entry;
        });
      })
      .addCase(updateEntry.fulfilled, (state, { payload }) => {
        state.entries = state.entries.map((entry) => {
          if (entry._id === payload.updatedEntry._id) {
            return payload.updatedEntry;
          }
          return entry;
        });
      })
      .addCase(updateEntryTitle.fulfilled, (state, { payload }) => {
        state.entries = state.entries.map((entry) => {
          if (entry._id === payload.updatedEntry._id) {
            return payload.updatedEntry;
          }
          return entry;
        });
      })
      .addCase(addManualEntry.fulfilled, (state, { payload }) => {
        state.entries.push(payload.entry);
      })
      .addCase(getMoreEntries.fulfilled, (state, { payload }) => {
        state.entries = state.entries.length
          ? [...state.entries, ...payload.entries]
          : payload.entries;
        state.lastEntryDate = payload.lastFetchedDate;
      })

      .addCase(markEntryAsBillableNonBillable.pending, (state) => {
        state.loading.billable = true;
        state.error = null;
      })

      .addCase(markEntryAsBillableNonBillable.fulfilled, (state, action) => {
        const { entry } = action.payload;
        state.loading.billable = false;
        const index = state.entries.findIndex((e) => e._id === entry._id);
        if (index !== -1) {
          state.entries[index].isBillable = entry.isBillable;
        }
      })
      .addCase(markEntryAsBulkIsBillableNonBillable.pending, (state) => {
        state.loading.bulkBillable = true;
      })
      .addCase(
        markEntryAsBulkIsBillableNonBillable.fulfilled,
        (state, action) => {
          state.loading.bulkBillable = false;
          const { updatedEntries } = action.payload;

          updatedEntries.forEach((updatedEntry) => {
            const index = state.entries.findIndex(
              (e) => e._id === updatedEntry._id
            );
            if (index !== -1) {
              state.entries[index] = updatedEntry;
            } else {
              state.entries.push(updatedEntry);
            }
          });
        }
      );
  },
});

const selectTimer = (state) => state.timer;
const selectEntries = (state) => state.timer.entries;
const selectLastEntry = (state) => state.timer.lastEntryDate;
const selectEntryDay = (state) => state.timer.entryDay;
const selectTimerState = (state) => state.timer;
const selectBillableState = (state) => state.timer.loading.billable;
const selectBulkBillableState = (state) => state.timer.loading.bulkBillable;

const selectEntriesByDate = (selectorOptions = {}) =>
  createSelector(
    [selectEntries, (state, date) => date],
    (entries, date) => entries?.filter(entry.startTime === date),
    selectorOptions
  );

const selectRunningTimer = createSelector([selectTimerState], (timer) => {
  return timer.runningTimer;
});

const {
  inputTextChange,
  setProjectChangeInTimer,
  setEntries,
  setEntryDay,
  updateRunningTimer,
  setRunningTimer,
} = timerSlice.actions;

export {
  startTimer,
  stopTimer,
  resumeTimer,
  selectTimer,
  setEntries,
  selectEntries,
  selectEntriesByDate,
  selectLastEntry,
  deleteEntry,
  updateEntry,
  updateEntryTitle,
  inputTextChange,
  setProjectChangeInTimer,
  addManualEntry,
  setEntryDay,
  selectEntryDay,
  setRunningTimer,
  selectRunningTimer,
  updateRunningTimer,
  selectBillableState,
  selectBulkBillableState,
};

export default timerSlice.reducer;
