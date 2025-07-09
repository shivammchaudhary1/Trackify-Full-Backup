import { Box, Modal, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo, selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import { createWorkspace } from "##/src/app/workspaceSlice.js";
import {
  CloseButton,
  LoadingButton,
  SaveButton,
} from "##/src/components/buttons/index.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";

const AddWorkspaceModal = ({ open, handleClose, setProgress }) => {
  const [name, setName] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const dispatchToRedux = useDispatch();
  const user = useSelector(selectMe);
  const theme = useSelector(selectCurrentTheme);

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const handleSubmit = async () => {
    try {
      if (name.trim() === "") {
        setNotification("Please enter a workspace name", "info");
        return;
      }
      setProgress(30);
      setButtonLoading(true);
      await dispatchToRedux(
        createWorkspace({
          userId: user._id,
          name,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
      ).unwrap();
      await dispatchToRedux(getUserInfo({ userId: user._id })).unwrap();
      setNotification("Workspace created successfully", "success");
      handleClose();
      setProgress(100);
      setButtonLoading(false);
      setName("");
    } catch (error) {
      setProgress(100);
      setName("");
      setButtonLoading(false);
      handleError(`Failed to create workspace, ${error.message}`);
    }
  };

  return (
    <Modal
      onClose={handleClose}
      open={open}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          padding: "10px",
          width: ["80%", "50%", "35%"],
          borderRadius: "5px",
          gap: "12px",
          position: "relative",
          paddingBottom: "10px",
        }}
      >
        <Typography
          sx={{
            color: theme?.secondaryColor,
            fontSize: "18px",
            paddingTop: "10px",
          }}
        >
          Add Workspace
        </Typography>
        <TextField
          label="Workspace name"
          onChange={(e) => setName(e.target.value)}
          sx={{ width: "96%" }}
          value={name}
          variant="standard"
        />
        {buttonLoading ? (
          <LoadingButton theme={theme} />
        ) : (
          <SaveButton onSave={handleSubmit} theme={theme} />
        )}
        <CloseButton onClose={handleClose} theme={theme} />
      </Box>
    </Modal>
  );
};
export default AddWorkspaceModal;
