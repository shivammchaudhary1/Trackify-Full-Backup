import { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectMe, selectUserRole } from "##/src/app/profileSlice.js";
import { AuthContext } from "##/src/context/authcontext.js";

function AdminRoute({ path, element }) {
  const { isAuthenticated, setRedirectPath, redirectUser } =
    useContext(AuthContext);
  const isAdmin = useSelector(selectUserRole);
  const user = useSelector(selectMe);

  useEffect(() => {
    if (!isAuthenticated) {
      return setRedirectPath(path);
    }
  }, [isAuthenticated, isAdmin, setRedirectPath, path, redirectUser, user]);

  if (isAuthenticated) {
    return element;
  }
  // return isAuthenticated ? element : <Navigate replace to="/signin" />;
}

export default AdminRoute;
