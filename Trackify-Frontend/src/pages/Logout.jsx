import { useEffect, useTransition } from "react";
import { useDispatch } from "react-redux";
import { logout } from "##/src/app/authSlice.js";
import BackdropLoader from "##/src/components/loading/BakdropLoader.jsx";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";

function SignOutUser() {
  const dispatchToRedux = useDispatch();
  const [isLoading, startTransition] = useTransition();

  const { handleError } = useErrorHandler();

  useEffect(() => {
    const logoutUser = async function logoutUser() {
      startTransition(async () => {
        try {
          localStorage.clear();
          await dispatchToRedux(logout()).unwrap();
          window.location.reload();
        } catch (error) {
          handleError(`Failed to logout: ${error.message}, Please try again.`);
        }
      });
    };

    logoutUser();
  }, [dispatchToRedux]);

  return <BackdropLoader />;
}
export default SignOutUser;
