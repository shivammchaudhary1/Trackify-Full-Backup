// App.js
import React, { useContext, useEffect, useState, useTransition } from "react";
import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Button,
  Grid2 as Grid,
  TextField,
} from "@mui/material";
import DisplayAutoPilotSettings from "##/src/components/settings/DisplayAutoPilotSettings.jsx";
import { useSelector } from "react-redux";
import { selectCurrentTheme, selectMe } from "##/src/app/profileSlice.js";
import {
  getHolidayTypes,
  selectHolidayTypes,
} from "##/src/app/holidaySlice.js";
import { useDispatch } from "react-redux";
import {
  createNewAutoAddLeaveBalanceSetting,
  updateAutoAddLeaveBalanceSetting,
} from "##/src/app/leaveSlice.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import { AuthContext } from "##/src/context/authcontext.js";
import { makeStyles } from "@mui/styles";
import {
  getNextExecutionDate,
  isFutureDate,
} from "##/src/utility/time/time.utility";

const initialLeaveSettingState = {
  type: "",
  numberOfLeaves: "",
  recurrence: "",
  frequency: "",
  nextExecutionDate: "",
  date: "",
};

const useStyles = makeStyles((theme) => ({
  selectMenu: {
    maxHeight: 200, // Adjust the max-height as needed
  },
}));

const AutoAddLeaveBaLance = () => {
  const [leaveSettingData, setLeaveSettingData] = useState(
    initialLeaveSettingState
  );
  const [leaveSettingEditId, setLeaveSettingEditId] = useState(null);
  const [isSavingNewSetting, startSavingNewSetting] = useTransition();

  const dispatchToRedux = useDispatch();
  const classes = useStyles();

  const leaveTypes = useSelector(selectHolidayTypes);
  const user = useSelector(selectMe);

  const theme = useSelector(selectCurrentTheme);

  const { handleError } = useErrorHandler();
  const { setNotification } = useSetNotification();
  const { setLoadingBarProgress } = useContext(AuthContext);

  function handleChange(event) {
    const { name, value } = event.target;

    setLeaveSettingData((prev) => {
      const updated = { ...prev, [name]: value };

      // Only compute nextExecutionDate if recurrence is 'repeat' and both frequency and date are present
      if (
        updated.recurrence === "repeat" &&
        updated.frequency &&
        updated.date
      ) {
        const computedNextExecutionDate = getNextExecutionDate(
          updated.recurrence,
          updated.frequency,
          Number(updated.date),
          updated.nextExecutionDate
        );

        updated.nextExecutionDate = computedNextExecutionDate;
      }

      return updated;
    });
  }

  function handleEdit(settingData) {
    if (!settingData) {
      return;
    }

    setLeaveSettingData({
      type: settingData.type,
      numberOfLeaves: settingData.numberOfLeaves,
      frequency: settingData.frequency,
      recurrence: settingData.recurrence,
      date: settingData.date,
      nextExecutionDate: settingData.nextExecutionDate
        ? settingData.nextExecutionDate.split("T")[0]
        : "",
    });
    setLeaveSettingEditId(settingData._id);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const {
      type,
      numberOfLeaves,
      frequency,
      date,
      nextExecutionDate,
      recurrence,
    } = leaveSettingData;

    if (
      !type ||
      !numberOfLeaves ||
      !recurrence ||
      (recurrence === "once" && !nextExecutionDate) ||
      (recurrence === "repeat" && (!frequency || !date || !nextExecutionDate))
    ) {
      setNotification(
        "All of the following fields are required: type, numberOfLeaves, frequency, date.",
        "warning"
      );
      return;
    }

    if (!isFutureDate(nextExecutionDate, recurrence)) {
      setNotification("Date must be in the future for a one-time.", "warning");
      return;
    }
    setLoadingBarProgress(30);
    startSavingNewSetting(async () => {
      try {
        await dispatchToRedux(
          createNewAutoAddLeaveBalanceSetting({
            date,
            frequency,
            nextExecutionDate,
            numberOfLeaves,
            recurrence,
            type,
          })
        ).unwrap();
        setLoadingBarProgress(100);
        setNotification("Successfully saved the setting.", "success");
        setLeaveSettingData(initialLeaveSettingState);
      } catch (error) {
        setLoadingBarProgress(100);
        handleError(`Failed to save the setting, ${error.message}`);
      }
    });
  };

  function handleUpdate(event) {
    event.preventDefault();
    const {
      type,
      numberOfLeaves,
      frequency,
      date,
      nextExecutionDate,
      recurrence,
    } = leaveSettingData;

    if (
      !type ||
      !numberOfLeaves ||
      !recurrence ||
      (recurrence === "once" && !nextExecutionDate) ||
      (recurrence === "repeat" && (!frequency || !date))
    ) {
      setNotification(
        "All of the following fields are required: type, number of leaves, frequency, date.",
        "warning"
      );
      return;
    }

    if (!isFutureDate(nextExecutionDate, recurrence)) {
      setNotification("Date must be in the future for a one-time.", "warning");
      return;
    }

    setLoadingBarProgress(30);
    startSavingNewSetting(async () => {
      try {
        await dispatchToRedux(
          updateAutoAddLeaveBalanceSetting({
            type,
            numberOfLeaves,
            frequency,
            date,
            settingId: leaveSettingEditId,
            nextExecutionDate,
            recurrence,
          })
        ).unwrap();
        setLoadingBarProgress(100);
        setLeaveSettingEditId(null);
        setNotification("Successfully saved the setting.", "success");
        setLeaveSettingData(initialLeaveSettingState);
      } catch (error) {
        setLoadingBarProgress(100);
        handleError(`Failed to save the setting, ${error.message}`);
      }
    });
  }

  useEffect(() => {
    if (user && !leaveTypes.length) {
      dispatchToRedux(getHolidayTypes({ userId: user._id }));
    }
  }, [user]);

  return (
    <Grid container>
      <Grid
        size={[12, 12, 4, 4]}
        maxWidth={"100%"}
        sx={{
          width: "100%",
          ml: [1, 1, -1],
        }}
      >
        <Box
          sx={{
            mt: 3,
            p: 2,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: "white",

            width: "100%",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
            gutterBottom
            sx={{ mb: 2 }}
          >
            {leaveSettingEditId ? "Update Setting" : "Add new"}
          </Typography>
          <form onSubmit={leaveSettingEditId ? handleUpdate : handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel id="schedule-type-label">
                    Schedule Type
                  </InputLabel>
                  <Select
                    name="recurrence"
                    labelId="schedule-type-label"
                    value={leaveSettingData.recurrence}
                    label="Schedule Type"
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="once">Once</MenuItem>
                    <MenuItem value="repeat">Repeat</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel id="leave-type-label">Type of Leave</InputLabel>
                  <Select
                    name="type"
                    labelId="leave-type-label"
                    value={leaveSettingData.type}
                    label="Type of Leave"
                    onChange={handleChange}
                    sx={{ textTransform: "capitalize" }}
                    required
                  >
                    {leaveTypes.map((typeData) => {
                      if (typeData.paid && typeData.isActive) {
                        return (
                          <MenuItem
                            key={typeData._id}
                            value={typeData.leaveType}
                            sx={{ textTransform: "capitalize" }}
                          >
                            {typeData.title}
                          </MenuItem>
                        );
                      }
                      return null;
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel id="leave-number-label">
                    Number of Leaves
                  </InputLabel>
                  <Select
                    name="numberOfLeaves"
                    labelId="leave-number-label"
                    value={leaveSettingData.numberOfLeaves}
                    label="Number of Leaves"
                    onChange={handleChange}
                    MenuProps={{
                      classes: { paper: classes.selectMenu },
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                    }}
                    required
                  >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={7}>7</MenuItem>
                    <MenuItem value={8}>8</MenuItem>
                    <MenuItem value={9}>9</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={11}>11</MenuItem>
                    <MenuItem value={12}>12</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {leaveSettingData.recurrence === "repeat" && (
                <>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel id="leave-frequency-label">
                        Frequency
                      </InputLabel>
                      <Select
                        name="frequency"
                        labelId="leave-frequency-label"
                        value={leaveSettingData.frequency}
                        label="Frequency"
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value="month">Monthly</MenuItem>
                        <MenuItem value="quarter">Quarterly</MenuItem>
                        <MenuItem value="halfYear">Every 6 Months</MenuItem>
                        <MenuItem value="year">Yearly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel id="leave-number-label">
                        Choose a date
                      </InputLabel>
                      <Select
                        name="date"
                        labelId="leave-date-label"
                        value={leaveSettingData.date}
                        label="Choose a date"
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              {leaveSettingData.recurrence === "once" && (
                <Grid size={12}>
                  <FormControl fullWidth>
                    <TextField
                      name="nextExecutionDate"
                      label="Choose a date"
                      type="date"
                      value={leaveSettingData.nextExecutionDate || ""}
                      onChange={handleChange}
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                      required
                    />
                  </FormControl>
                </Grid>
              )}
              <Grid size={12}>
                <Button
                  disabled={isSavingNewSetting}
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ backgroundColor: theme?.secondaryColor }}
                  fullWidth
                >
                  {leaveSettingEditId ? "Update" : "Save"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Grid>
      <Grid size={[12, 12, 8, 8]}>
        {!!leaveTypes.length && (
          <DisplayAutoPilotSettings
            onEdit={handleEdit}
            leaveTypes={leaveTypes}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default AutoAddLeaveBaLance;
