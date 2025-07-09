import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { CloseButton, SaveButton } from "##/src/components/buttons/index.js";

const UpdateRuleModal = ({
  open,
  onClose,
  onUpdate,
  theme,
  rule,
  activeRules,
}) => {
  const [weekDays, setWeekDays] = useState(rule.weekDays || []);
  const [workingHours, setWorkingHours] = useState(rule.workingHours);
  const [isActive, setIsActive] = useState(rule.isActive);
  const [workingDays, setWorkingDays] = useState(rule.workingDays);

  const handleWeekDaysChange = (event) => {
    setWeekDays(event.target.value);
    setWorkingDays(event.target.value.length);
  };

  const handleWorkingHoursChange = (event) => {
    setWorkingHours(event.target.value);
  };

  const handleToggleChange = () => {
    setIsActive(!isActive);
  };

  const handleUpdate = async () => {
    const formData = {
      weekDays,
      workingHours,
      isActive,
      workingDays,
    };

    // Pass the form data to the onUpdate function
    await onUpdate(formData);

    // Close the modal after submitting
    await onClose();
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
              color: theme?.secondaryColor,
              fontSize: "18px",
              paddingTop: "10px",
            }}
          >
            Update Default Rule
          </Typography>
          <FormControl sx={{ width: "96%" }}>
            <InputLabel>Working Days</InputLabel>
            <Select
              multiple
              label="Working Days"
              onChange={handleWeekDaysChange}
              renderValue={(selected) => (
                <div>
                  {selected.map((value) => (
                    <span key={value}>{value}, </span>
                  ))}
                </div>
              )}
              value={weekDays}
            >
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((day) => (
                <MenuItem key={day} value={day}>
                  <Checkbox checked={weekDays.includes(day)} />
                  <ListItemText primary={day} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Working Hours"
            onChange={handleWorkingHoursChange}
            sx={{ width: "96%" }}
            type="number"
            value={workingHours}
            variant="standard"
          />

          <TextField
            label="Working Days"
            onChange={handleWorkingHoursChange}
            sx={{ width: "96%" }}
            type="number"
            value={workingDays}
            variant="standard"
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Typography>{isActive ? "Active" : "Inactive"}</Typography>
            <FormControlLabel
              control={
                <Switch
                  disabled={activeRules === 1}
                  checked={isActive}
                  onChange={handleToggleChange}
                />
              }
            />
          </Box>

          <SaveButton onSave={handleUpdate} theme={theme} />
          <CloseButton onClose={onClose} theme={theme} />
        </Box>
      </Modal>
    </>
  );
};

export default UpdateRuleModal;
