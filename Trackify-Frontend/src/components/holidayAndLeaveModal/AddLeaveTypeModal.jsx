import {
  Box,
  Button,
  CircularProgress,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { CloseButton, SaveButton } from "##/src/components/buttons/index.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";

const AddLeaveTypeModal = ({ open, onClose, handleAddLeaveType, theme }) => {
  const [leaveType, setLeaveType] = useState("");
  const [leaveTitle, setLeaveTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { setNotification } = useSetNotification();

  const handleInputChange = (event) => {
    setLeaveType(event.target.value);
  };
  const handleLeaveTitleChange = (event) => {
    setLeaveTitle(event.target.value);
  };

  const handleAddClick = async () => {
    if (!leaveType && !leaveTitle) {
      setNotification("Please enter leave type and leave title", "warning");
      return;
    }
    setLoading(true);
    try {
      await handleAddLeaveType({ leaveType, leaveTitle });
      setLoading(false);
      onClose();
    } catch (error) {
      setLoading(false);
      // setNotification(`Failed to add leave type, ${error.message}`, "error");
      onClose();
    }
  };

  return (
    <>
      <Modal
        onClose={onClose}
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
              color: theme.secondaryColor,
              fontSize: "16px",
              paddingTop: "10px",
            }}
          >
            Add Leave Type
          </Typography>
          <TextField
            label="Title"
            onChange={handleLeaveTitleChange}
            sx={{ width: "96%" }}
            value={leaveTitle}
            variant="standard"
          />
          <TextField
            label="Type"
            onChange={handleInputChange}
            sx={{ width: "96%" }}
            value={leaveType}
            variant="standard"
          />
          {loading ? (
            <Button
              sx={{
                backgroundColor: theme?.secondaryColor,
                width: "96%",
                fontSize: "16px",
                ":hover": {
                  backgroundColor: theme?.secondaryColor,
                },
              }}
              variant="contained"
            >
              <CircularProgress color="inherit" />
            </Button>
          ) : (
            <SaveButton onSave={handleAddClick} theme={theme} />
          )}
          <CloseButton onClose={onClose} theme={theme} />
        </Box>
      </Modal>
    </>
  );
};

export default AddLeaveTypeModal;
