import {
  Box,
  Button,
  CircularProgress,
  Modal,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CloseButton, SaveButton } from "##/src/components/buttons/index.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";

const UpdateLeaveTypeModal = ({
  open,
  handleClose,
  handleUpdateLeaveType,
  initialLeaveType,
  theme,
}) => {
  const [leaveType, setLeaveType] = useState("");
  const [leaveTitle, setLeaveTitle] = useState("");
  const [paid, setPaid] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setNotification } = useSetNotification();

  const handleInputChange = (event) => {
    setLeaveType(event.target.value);
  };
  const handleTitleChange = (event) => {
    setLeaveTitle(event.target.value);
  };

  const handleToggle = () => {
    setPaid(!paid);
  };

  const handleLeaveTypeActive = () => {
    setIsActive(!isActive);
  };

  const handleUpdateClick = () => {
    if (
      leaveType === initialLeaveType.leaveType &&
      leaveTitle === initialLeaveType.title &&
      isActive === initialLeaveType.isActive &&
      initialLeaveType.paid === paid
    ) {
      setNotification("No changes made", "info");
      return;
    }

    handleUpdateLeaveType(
      { leaveTitle, leaveType, paid, isActive },
      handleClose,
      setLoading
    );
  };

  useEffect(() => {
    if (initialLeaveType) {
      setLeaveType(initialLeaveType.leaveType);
      setLeaveTitle(initialLeaveType.title);
      setPaid(initialLeaveType.paid);
      setIsActive(initialLeaveType.isActive);
    }
  }, [initialLeaveType]);

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
            color: theme.secondaryColor,
            fontSize: "16px",
            paddingTop: "10px",
          }}
        >
          Update Leave Type
        </Typography>
        <TextField
          label="Leave Title"
          onChange={handleTitleChange}
          sx={{ width: "96%" }}
          value={leaveTitle || ""}
          variant="standard"
        />
        <TextField
          label="Leave Type"
          disabled
          onChange={handleInputChange}
          sx={{ width: "96%" }}
          value={leaveType}
          variant="standard"
        />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Switch
              checked={paid}
              inputProps={{ "aria-label": "controlled" }}
              onChange={handleToggle}
            />{" "}
            <Typography sx={{ fontSize: "16px" }}>
              {paid ? "Paid" : "Unpaid"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Switch
              checked={isActive}
              inputProps={{ "aria-label": "controlled" }}
              onChange={handleLeaveTypeActive}
            />
            <Typography sx={{ fontSize: "16px" }}>
              {isActive ? "Active" : "Inactive"}
            </Typography>
          </Box>
        </Box>
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
          <SaveButton onSave={handleUpdateClick} theme={theme} />
        )}
        <CloseButton onClose={handleClose} theme={theme} />
      </Box>
    </Modal>
  );
};

export default UpdateLeaveTypeModal;
