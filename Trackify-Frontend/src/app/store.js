import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import alertReducer from "##/src/app/alertSlice.js";
import authReducer from "##/src/app/authSlice.js";
import calculationSlice from "##/src/app/calculationSlice.js";
import clientReducer from "##/src/app/clientSlice.js";
import holidaySlice from "##/src/app/holidaySlice.js";
import leaveSlice from "##/src/app/leaveSlice.js";
import loadingSlice from "##/src/app/loadingSlice";
import profileSlice from "##/src/app/profileSlice.js";
import projectSlice from "##/src/app/projectSlice.js";
import reportSlice from "##/src/app/reportSlice.js";
import teamSlice from "##/src/app/teamSlice.js";
import timerReducer from "##/src/app/timerSlice.js";
import demoReducer from "##/src/app/demoSlice.js";
import userDetailsSlice from "##/src/app/userDetailsSlice";
import workspaceReducer from "##/src/app/workspaceSlice.js";
import assetSlice from "##/src/app/assetSlice";

const persistConfig = {
  key: "user",
  version: 1,
  storage,
};

const demoPersistConfig = {
  key: "demo",
  version: 1,
  storage,
};

// Combine all your reducers into a root reducer
const appReducer = combineReducers({
  auth: persistReducer(persistConfig, authReducer),
  timer: timerReducer,
  workspace: workspaceReducer,
  client: clientReducer,
  project: projectSlice,
  user: profileSlice,
  team: teamSlice,
  userDetails: userDetailsSlice,
  holiday: holidaySlice,
  report: reportSlice,
  alert: alertReducer,
  loading: loadingSlice,
  leave: leaveSlice,
  calculation: calculationSlice,
  demo: persistReducer(demoPersistConfig, demoReducer),
  assets: assetSlice,
});

const rootReducer = (state, action) => {
  if (action.type === "RESET_STATE") {
    state = {}; // Reset state
  }
  return appReducer(state, action);
};

// Create a Redux store with the root reducer and Redux Toolkit's middleware
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  preloadedState: {},
});

const persistor = persistStore(store);

export { store, persistor };
