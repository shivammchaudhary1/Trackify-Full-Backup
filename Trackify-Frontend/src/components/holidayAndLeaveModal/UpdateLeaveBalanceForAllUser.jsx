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
import { useState } from "react";
import { CloseButton, SaveButton } from "##/src/components/buttons/index.js";
import { capitalizeFirstWord } from "../../utility/miscellaneous/capitalize";

const UpdateLeaveBalanceForAllUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  theme,
  leaveTypes,
  buttonLoading,
}) => {
  const [leaveType, setLeaveType] = useState("");
  const [amount, setAmount] = useState(0);

  const handleLeaveTypeChange = (event) => {
    setLeaveType(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleSubmit = () => {
    onSubmit(setAmount, setLeaveType, { leaveType, amount });
  };

  return (
    <>
      {/* use mine  */}
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
            Add Leave Balance For All Users
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
    </>
  );
};

export default UpdateLeaveBalanceForAllUserModal;
