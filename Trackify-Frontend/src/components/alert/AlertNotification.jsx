import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectAlert, removeStackMessage } from "##/src/app/alertSlice.js";
import { ALERT_TIMEOUT } from "##/src/utility/alert.js";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert ref={ref} elevation={6} {...props} />;
});

function AlertNotification() {
  const { messageStack, isVisible } = useSelector(selectAlert);
  const dispatchToRedux = useDispatch();

  function handleClose(index, message) {
    dispatchToRedux(removeStackMessage({ index, message }));
  }

return (
  <Stack
    spacing={2}
    sx={{ width: "100%", display: "flex", justifyContent: "center" }}
    maxHeight={200}
  >
    {messageStack.map((messageData, index) => (
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={ALERT_TIMEOUT}
        open={isVisible}
        key={`${index}.${messageData.message}`}
        style={{
          position: "fixed",
          bottom: `${16 + index * 55}px`,
          zIndex: 1400,
        }}
      >
        <Alert
          severity={messageData.type}
          onClose={() => handleClose({ index, message: messageData.message })}
          sx={{ width: "100%" }}
        >
          {messageData.message}
        </Alert>
      </Snackbar>
    ))}
  </Stack>
);
}

export default AlertNotification;
