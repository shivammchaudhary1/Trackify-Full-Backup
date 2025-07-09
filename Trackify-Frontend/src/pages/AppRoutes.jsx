import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import { PrivateRoute } from "##/src/components/route/ProtectedRoute.jsx";
import loadWithLazyLoader from "##/src/pages/lazyLoader/loadWithLazyLoader.jsx";
import Settings from "./Settings";

const AdminRoute = loadWithLazyLoader(
  () => import("##/src/components/route/AdminRoute.jsx")
);

// Pages
const DashBoard = loadWithLazyLoader(
  () => import("##/src/pages/DashBoard.jsx")
);
const Clients = loadWithLazyLoader(() => import("##/src/pages/Clients.jsx"));
const Projects = loadWithLazyLoader(() => import("##/src/pages/Projects.jsx"));
const Holidays = loadWithLazyLoader(() => import("##/src/pages/Holidays.jsx"));
const Reports = loadWithLazyLoader(() => import("##/src/pages/Reports.jsx"));
const Users = loadWithLazyLoader(() => import("##/src/pages/Users.jsx"));
const Profile = loadWithLazyLoader(() => import("##/src/pages/Profile.jsx"));
const Logout = loadWithLazyLoader(() => import("##/src/pages/Logout.jsx"));
const AcceptUserInvitation = loadWithLazyLoader(
  () => import("##/src/pages/AcceptUserInvitation.jsx")
);
const ForgotPassword = loadWithLazyLoader(
  () => import("##/src/components/ForgotPassword/ForgotPassword")
);
const CreateNewPassword = loadWithLazyLoader(
  () => import("##/src/components/ForgotPassword/CreateNewPasssword")
);
const SignIn = loadWithLazyLoader(() => import("##/src/pages/SignIn.jsx"));
const SignUp = loadWithLazyLoader(() => import("##/src/pages/SignUp.jsx"));

function AppRoutes() {
  const [progress, setProgress] = useState(0);
  return (
    <>
      {!!progress && (
        <LoadingBar color="#f11946" height="3px" progress={progress} />
      )}
      <LoadingBar color="#f11946" height="3px" progress={progress} />
      <Routes>
        <Route
          element={
            <PrivateRoute
              element={<DashBoard setProgress={setProgress} />}
              path="/dashboard"
            />
          }
          path="/dashboard"
        />
        <Route element={<SignIn />} path="/signin" />
        <Route element={<SignUp />} path="/signup" />
        <Route
          element={<AdminRoute element={<Clients />} path="/clients" />}
          path="/clients"
        />
        <Route
          element={
            <PrivateRoute
              element={<Projects setProgress={setProgress} />}
              path="/projects"
            />
          }
          path="/projects"
        />
        <Route
          element={<PrivateRoute element={<DashBoard />} path="/" />}
          path="/"
        />
        <Route
          element={
            <PrivateRoute
              element={<Reports setProgress={setProgress} />}
              path="/reports"
            />
          }
          path="/reports"
        />
        <Route
          element={
            <PrivateRoute
              element={<Profile setProgress={setProgress} />}
              path="/profile"
            />
          }
          path="/profile"
        />
        <Route
          element={
            <PrivateRoute
              element={<Holidays setProgress={setProgress} />}
              path="/holidays"
            />
          }
          path="/holidays"
        />
        <Route
          element={
            <AdminRoute
              element={<Users setProgress={setProgress} />}
              path="/users"
            />
          }
          path="/users"
        />
        <Route
          element={<PrivateRoute element={<Logout />} path="/logout" />}
          path="/logout"
        />
        <Route element={<AcceptUserInvitation />} path="/invite-new" />
        <Route element={<ForgotPassword />} path="/resetpassword" />
        <Route
          element={<CreateNewPassword />}
          path="/profile/forgetpassword/:id/:token"
        />
        <Route
          element={<AdminRoute element={<Settings />} path="/settings" />}
          path="/settings"
        />
      </Routes>
    </>
  );
}


export default AppRoutes;
