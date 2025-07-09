import { Backdrop, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { selectLoading } from "../../app/loadingSlice";

const Loader = () => {
  const loading = useSelector(selectLoading);

  return (
    <Backdrop
      open={loading}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgba(255, 255, 255, 255)",
      }}
    >
      <CircularProgress />
    </Backdrop>
  );
};

export default Loader;
