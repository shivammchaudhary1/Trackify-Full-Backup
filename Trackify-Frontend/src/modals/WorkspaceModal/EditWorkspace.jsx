import { Box, Modal, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import { updateWorkspace } from "##/src/app/workspaceSlice.js";
import {
  CloseButton,
  LoadingButton,
  SaveButton,
} from "##/src/components/buttons/index.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";

const EditWorkspaceModal = ({ open, handleClose, workspace, setProgress }) => {
  const [name, setName] = useState(workspace?.name || "");
  const [buttonLoading, setButtonLoading] = useState(false);
  const dispatchToRedux = useDispatch();
  const theme = useSelector(selectCurrentTheme);

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (workspace?.name !== undefined) {
      setName(workspace.name.replace("'s workspace", ""));
    }
  }, [workspace]);

  const handleSubmit = async () => {
    try {
      if (name.trim() === "") {
        setNotification("Please enter a workspace name", "info");
        return;
      }
      let tempName = name + "'s workspace";
      setProgress(30);
      setButtonLoading(true);
      await dispatchToRedux(
        updateWorkspace({
          name: tempName,
          workspaceId: workspace._id,
        })
      ).unwrap();
      setNotification("Workspace Edited successfully", "success");

      handleClose();
      setProgress(100);
      setButtonLoading(false);
      setName("");
    } catch (error) {
      handleError(`Error updating workspace, ${error.message}`);
      setProgress(100);
      setButtonLoading(false);
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
          Edit Workspace
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
export default EditWorkspaceModal;
