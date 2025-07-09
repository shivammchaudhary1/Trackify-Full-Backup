import React, { StrictMode } from "react";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "##/src/app/store.js";
import AuthProvider from "##/src/context/AuthContextProvider.jsx";
import { theme } from "##/src/utility/theme/theme.js";
import App from "##/src/App.jsx";
import "./index.css";
// import ErrorBoundary from "./components/error/ErrorBoundary";
// import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <ThemeProvider theme={theme}>
            {/* <ErrorBoundary> */}
            <AuthProvider>
              <App />
            </AuthProvider>
            {/* </ErrorBoundary> */}
          </ThemeProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);

// reportWebVitals();
