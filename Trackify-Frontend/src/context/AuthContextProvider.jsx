import { lazy, useEffect, useState, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  selectAuthenticated,
  setIsAuthenticated,
} from "##/src/app/authSlice.js";
import {
  selectLoading,
  startLoading,
  stopLoading,
} from "##/src/app/loadingSlice.js";
import { selectMe, selectUserRole, setMe } from "##/src/app/profileSlice.js";
import { setProjects } from "##/src/app/projectSlice.js";
import { setEntries, setRunningTimer } from "##/src/app/timerSlice.js";
import { setWorkspaces } from "##/src/app/workspaceSlice.js";
import FetchApi from "##/src/client.js";
import { ADMIN_ONLY_PATHS } from "##/src/utility/utility.js";

// Lazy components
const Footer = lazy(() => import("##/src/components/footer/Footer.jsx"));
const Header = lazy(() => import("##/src/components/header/Header.jsx"));

import { AuthContext } from "##/src/context/authcontext.js";
import { config } from "##/src/utility/config/config.js";
import { OPEN_PATHS, UNRESTRICTED_PATHS } from "##/src/utility/utility.js";
import { Box } from "@mui/material";

const checkAuth = async (dispatch, navigate, loading) => {
  if (!loading) {
    dispatch(startLoading());
  }

  try {
    const date = new Date();
    const response = await FetchApi.fetch(
      `${config.api}/api/auth/isAuthenticated`,
      {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({
          loginDate: new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
          ),
        }),
      }
    );

    const { user, entries, projects, workspaces, lastEntryDate } = response;
    updateDataToRedux(dispatch, {
      user,
      projects,
      workspaces,
      entries,
      lastEntryDate,
    });
    dispatch(stopLoading());
  } catch (error) {
    dispatch(setIsAuthenticated({ isAuthenticated: false }));
    dispatch(stopLoading());
    return navigate("/signin");
  }
};

const updateDataToRedux = (
  dispatch,
  { user, projects, workspaces, entries, lastEntryDate }
) => {
  let runningEntry;
  if (user.timer.isRunning) {
    runningEntry = entries.find((entry) => entry._id === user.timer.currentLog);
  }

  dispatch(setMe({ user }));
  dispatch(setProjects({ projects }));
  dispatch(setWorkspaces({ workspaces: user.workspaces }));
  dispatch(setEntries({ entries, reFetchRequired: true, lastEntryDate }));
  user.timer.isRunning &&
    user.timer.currentLog &&
    dispatch(
      setRunningTimer({
        ...user.timer,
        title: user.timer.currentLog?.title || "",
        projectId: user.timer.currentLog.project,
        startTime: user.timer.currentLog.startTime,
        entryId: user.timer.currentLog._id,
      })
    );
};

function AuthProvider({ children }) {
  const navigate = useNavigate();
  const dispatchToRedux = useDispatch();
  const [redirectPath, setRedirectPath] = useState(null);

  const isAuthenticated = useSelector(selectAuthenticated);
  const user = useSelector(selectMe);
  const isAdmin = useSelector(selectUserRole);
  const location = useLocation();

  const shouldDisplayHeaderFooter =
    isAuthenticated &&
    !OPEN_PATHS.includes(`/${location.pathname.split("/")[2]}`) &&
    !UNRESTRICTED_PATHS.includes(location.pathname);

  const isOpenPage =
    OPEN_PATHS.includes(`/${location.pathname.split("/")[2]}`) ||
    UNRESTRICTED_PATHS.includes(location.pathname) ||
    OPEN_PATHS.includes(location.pathname);

  const shouldNavigateToDashboard =
    isAuthenticated &&
    (location.pathname === "/" ||
      UNRESTRICTED_PATHS.includes(location.pathname) ||
      OPEN_PATHS.includes(`/${location.pathname.split("/")[2]}`));

  const [loadingBarProgress, setLoadingBarProgress] = useState(0);
  const loading = useSelector(selectLoading);

  const redirectUser = (path) => {
    setRedirectPath(path);
    return navigate(path);
  };

  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      !isAdmin &&
      ADMIN_ONLY_PATHS.includes(location.pathname)
    ) {
      window.location = "/dashboard";
    }

    if (isAuthenticated && !user) {
      checkAuth(dispatchToRedux, navigate, loading);
    }

    if (!isAuthenticated && !isOpenPage) {
      dispatchToRedux(stopLoading());
      navigate("/signin");
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (redirectPath) {
      const pathToRedirect = redirectPath;
      setRedirectPath(null);
      navigate(pathToRedirect);
    } else if (shouldNavigateToDashboard) {
      navigate("/dashboard");
    }
  }, [location.pathname, isAuthenticated, navigate, redirectPath]);

  useEffect(() => {
    if (loadingBarProgress === 100) {
      setLoadingBarProgress(0);
    }
  }, [loadingBarProgress]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setRedirectPath,
        redirectPath,
        redirectUser,
        loadingBarProgress,
        setLoadingBarProgress,
      }}
    >
      {shouldDisplayHeaderFooter && <Header />}
      {children}
      <Box sx={{ height: "50px" }}></Box>
      {shouldDisplayHeaderFooter && (
        <Box
          sx={{
            position: "fixed",
            bottom: "0px",
            display: "flex",
            alignItems: "center",
            ":hover": { cursor: "pointer" },
          }}
        >
          <Footer />
        </Box>
      )}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
