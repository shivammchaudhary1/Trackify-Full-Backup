import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { CloseButton, SaveButton } from "##/src/components/buttons/index.js";
import { capitalizeFirstWord } from "../../utility/miscellaneous/capitalize";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";

const UpdateLeaveBalanceModal = ({
  isOpen,
  onClose,
  onSubmit,
  theme,
  leaveTypes,
  buttonLoading,
  userCurrentLeaveBalance,
}) => {
  const [leaveType, setLeaveType] = useState("");
  const [amount, setAmount] = useState(0); // Initialize amount with 0
  const [initialBalance, setInitialBalance] = useState(0);
  const dispatchToRedux = useDispatch();

  const { setNotification } = useSetNotification();

  useEffect(() => {
    // Set the initial balance when leaveType changes
    const selectedLeaveType = userCurrentLeaveBalance?.leaveBalance.find(
      (balance) => balance.type === leaveType
    );
    if (selectedLeaveType) {
      setInitialBalance(selectedLeaveType.value);
      setAmount(selectedLeaveType.value);
    }
  }, [leaveType, userCurrentLeaveBalance?.leaveBalance]);

  const handleLeaveTypeChange = (event) => {
    setLeaveType(event.target.value);
  };

  const handleAmountChange = (event) => {
    if (isNaN(event.target.value)) {
      setNotification("Please enter a valid number", "warning");
    } else {
      setAmount(parseFloat(event.target.value));
    }
  };

  const handleIncrement = () => {
    setAmount(amount + 1);
  };

  const handleDecrement = () => {
    setAmount(amount - 1);
  };

  const handleSubmit = async () => {
    await onSubmit({ leaveType, amount });
    // onClose();
    setInitialBalance(0);
    setAmount(0);
    setLeaveType("");
  };

  return (
    <Modal
      onClose={onClose}
      open={isOpen}
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
          Update Leave Balance
        </Typography>
        <FormControl sx={{ width: "96%" }}>
          <InputLabel>Select Type</InputLabel>
          <Select
            label="Types"
            onChange={handleLeaveTypeChange}
            value={leaveType}
            variant="standard"
          >
            {leaveTypes.map(
              (type) =>
                type.isActive && (
                  <MenuItem key={type.leaveType} value={type.leaveType}>
                    {capitalizeFirstWord(type.title)}
                  </MenuItem>
                )
            )}
          </Select>
        </FormControl>
        <TextField
          label="Value"
          onChange={handleAmountChange}
          placeholder="Enter amount in Numbers"
          sx={{ width: "96%" }}
          type="number"
          value={amount}
          variant="standard"
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "90%",
            gap: "6%",
          }}
        >
          <Button
            onClick={handleIncrement}
            sx={{
              backgroundColor: theme?.secondaryColor,
              fontWeight: "bold",
              width: "96%",
              fontSize: "18px",
              ":hover": {
                backgroundColor: theme?.secondaryColor,
              },
            }}
            variant="contained"
          >
            +
          </Button>
          <Button
            onClick={handleDecrement}
            sx={{
              backgroundColor: theme?.secondaryColor,
              fontWeight: "bold",
              width: "96%",
              fontSize: "18px",
              ":hover": {
                backgroundColor: theme?.secondaryColor,
              },
            }}
            variant="contained"
          >
            -
          </Button>
        </Box>
        {buttonLoading ? (
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
          <SaveButton onSave={handleSubmit} theme={theme} />
        )}
        <CloseButton onClose={onClose} theme={theme} />
      </Box>
    </Modal>
  );
};

export default UpdateLeaveBalanceModal;
