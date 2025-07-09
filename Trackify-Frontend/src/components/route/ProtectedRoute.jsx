import { useContext, useEffect } from "react";
// import { Navigate } from "react-router-dom";
import { AuthContext } from "##/src/context/authcontext.js";

function PrivateRoute({ path, element }) {
  const { isAuthenticated, setRedirectPath } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      setRedirectPath(path);
    }
  }, [isAuthenticated, path, setRedirectPath]);

  if (isAuthenticated) return element;
}

export { PrivateRoute };
