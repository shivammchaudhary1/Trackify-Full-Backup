import { useContext } from "react";
import { useSelector } from "react-redux";
import LoadingBar from "react-top-loading-bar";
import { selectAlert } from "##/src/app/alertSlice.js";
import { selectLoading } from "##/src/app/loadingSlice.js";
import Loader from "##/src/components/loading/Loader";
import { AuthContext } from "##/src/context/authcontext.js";
import AppRoutes from "##/src/pages/AppRoutes.jsx";
import AlertNotification from "##/src/components/alert/AlertNotification.jsx";
import Demo from "##/src/components/Demo/Demo.jsx";

function App() {
  const loading = useSelector(selectLoading);
  const alert = useSelector(selectAlert);
  const { isDemoDone } = useSelector((state) => state.demo);
  
  return (
    <>
      {loading && <Loader />}
      {!!alert.isVisible && <AlertNotification />}
      <Demo />
      <AppRoutes />
    </>
  );
}

export default App;
