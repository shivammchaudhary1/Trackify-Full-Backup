import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  applyLeave,
  getUsersLeave,
  getUsersLeaveBalance,
  selectUserLeaveBalance,
} from "##/src/app/leaveSlice";
import { selectCurrentWorkspace, selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import {
  getCalculationRule,
  selectCalculationRules,
} from "../../app/calculationSlice.js";
import { selectHolidayTypes, selectHolidays } from "../../app/holidaySlice";
import ConfirmationModal from "../holidayAndLeaveModal/ConfirmationModal";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import { AuthContext } from "##/src/context/authcontext.js";

const LeaveForm = ({ setOpenLeaveForm }) => {
  const [state, setState] = useState({
    title: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    dailyDetails: [], // Updated to store an array of daily details
  });
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);

  const { setLoadingBarProgress: setProgress } = useContext(AuthContext);

  const theme = useSelector(selectCurrentTheme);
  const user = useSelector(selectMe);
  const workspaceId = useSelector(selectCurrentWorkspace);
  const leaveBalances = useSelector(selectUserLeaveBalance);
  const rules = useSelector(selectCalculationRules);
  const holiday = useSelector(selectHolidays);
  const leaveTypes = useSelector(selectHolidayTypes);
  const dispatchToRedux = useDispatch();

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    dispatchToRedux(
      getCalculationRule({
        userId: user._id,
        workspaceId: user.currentWorkspace,
      })
    );

    // Find the selected leave type in the leaveBalances array
    if (state.leaveType) {
      const selectedLeaveType = leaveBalances.leaveBalance.find(
        (balance) => balance.type === state.leaveType
      );
      if (selectedLeaveType) {
        setAvailableBalance(selectedLeaveType.value);
      }
    }
  }, [state.leaveType, leaveBalances]);

  const handleChange = (event) => {
    const selectedLeaveType = event.target.value;
    const selectedLeaveBalance = leaveBalances.leaveBalance.find(
      (balance) => balance.type === selectedLeaveType
    );

    // Find the selected leave type in the leaveTypes array
    const selectedLeaveTypeInfo = leaveTypes.find(
      (type) => type.leaveType === selectedLeaveType
    );

    if (selectedLeaveBalance && selectedLeaveBalance.value === 0) {
      // Check if the selected leave type is in the paid category
      if (selectedLeaveTypeInfo && selectedLeaveTypeInfo.paid) {
        // Show HTML alert for zero balance in the paid category
        setNotification(
          "You need to apply in different/unpaid category as the balance is zero.",
          "warning"
        );
        return;
      }
    }

    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };

  const handleTitleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };

  const handleClose = () => {
    setOpenLeaveForm(false);
  };

  const handleStartDateChange = (event) => {
    const startDate = event.target.value;
    const endDate = startDate;
    const dailyDetails = generateDailyDetails(startDate, endDate);
    const daysDifference = calculateDaysDifference(
      startDate,
      endDate,
      dailyDetails
    );

    setState({
      ...state,
      startDate,
      endDate,
      dailyDetails,
      daysDifference,
    });
  };

  const handleEndDateChange = (event) => {
    const endDate = event.target.value;
    const dailyDetails = generateDailyDetails(state.startDate, endDate);
    const daysDifference = calculateDaysDifference(
      state.startDate,
      endDate,
      dailyDetails
    );

    setState({
      ...state,
      endDate,
      dailyDetails,
      daysDifference,
    });
  };

  const calculateDaysDifference = (startDate, endDate, dailyDetails) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let differenceInDays = 0;

    while (start <= end) {
      if (checkHoliday(start)) {
        start.setDate(start.getDate() + 1);
        continue;
      }
      const selectedDay = dailyDetails.find(
        (dailyDetail) =>
          new Date(dailyDetail.day).toISOString().split("T")[0] ===
          start.toISOString().split("T")[0]
      );

      if (selectedDay) {
        differenceInDays += selectedDay.duration === "halfday" ? 0.5 : 1;
      } else {
        differenceInDays += 1;
      }

      start.setDate(start.getDate() + 1);
    }

    return differenceInDays;
  };

  const generateDailyDetails = (startDate, endDate, leaveType) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dailyDetails = [];

    while (start <= end) {
      dailyDetails.push({
        day: new Date(start),
        duration: leaveType === "halfday" ? "halfday" : "fullday",
      });

      start.setDate(start.getDate() + 1);
    }

    return dailyDetails;
  };

  const handleDailyDetailsChange = (index, field, value) => {
    const updatedDailyDetails = [...state.dailyDetails];
    updatedDailyDetails[index][field] = value;

    const daysDifference = calculateDaysDifference(
      state.startDate,
      state.endDate,
      updatedDailyDetails
    );

    setState({
      ...state,
      dailyDetails: updatedDailyDetails,
      daysDifference,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setConfirmationModalOpen(true);
  };

  const checkHoliday = (dateString) => {
    const activeRule = rules.filter((rule) => rule.isActive)[0];
    const holidays = [];
    const week = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    for (let day of week) {
      if (!activeRule.weekDays.includes(day)) holidays.push(day);
    }
    let isHoliday = false;
    const day = new Date(dateString).getDay();
    if (holidays.includes(week[day])) isHoliday = true;

    for (let el of holiday) {
      if (
        new Date(el.date).toDateString() ===
          new Date(dateString).toDateString() &&
        el.type !== "Restricted"
      )
        isHoliday = true;
    }
    return isHoliday;
  };

  function isRestricted(dateToCheck) {
    const inputDate = new Date(dateToCheck).toISOString();

    for (const leave of holiday) {
      if (inputDate === leave.date && leave.type === "Restricted") {
        return true;
      }
    }

    return false;
  }

  function hasRestrictedBalance(leaveBalances) {
    const restrictedLeave = leaveBalances.find(
      (balance) => balance.type === "restricted"
    );
    return restrictedLeave && restrictedLeave.value > 0;
  }

  const handleConfirmation = async () => {
    setButtonLoading(true);

    if (hasRestrictedBalance(leaveBalances.leaveBalance)) {
      if (state.leaveType === "restricted" && !isRestricted(state.startDate)) {
        setButtonLoading(false);
        setNotification(
          "Restricted leaves can be applied only on Restricted Holidays",
          "warning"
        );
        return;
      }
    }

    try {
      setProgress(30);
      await dispatchToRedux(
        applyLeave({
          userId: user._id,

          title: state.title,
          type: state.leaveType,
          startDate: state.startDate,
          endDate: state.endDate,
          numberOfDays: state.daysDifference,
          dailyDetails: state.dailyDetails.filter(
            (dailyDetail) => !checkHoliday(dailyDetail.day)
          ),
          description: state.reason,
        })
      ).unwrap();
      setButtonLoading(false);
      setProgress(100);
      setState({
        title: "",
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        dailyDetails: [],
      });

      dispatchToRedux(
        getUsersLeaveBalance({
          userId: user._id,
          workspaceId: workspaceId,
        })
      );
      dispatchToRedux(getUsersLeave());
      setNotification("Leave applied successfully", "success");
      handleClose();
    } catch (error) {
      setProgress(100);
      handleError(`Failed to apply leave, ${error}`);
    } finally {
      setButtonLoading(false);
      setConfirmationModalOpen(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          // border: "1px solid black",
          display: "flex",
          marginTop: "-2rem",
          gap: "1rem",
        }}
      >
        <Box
          sx={{
            // border: "1px solid red",
            width: "65%",

            padding: "1rem",
            borderRadius: "5px",
            boxShadow:
              "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
          }}
        >
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              label="Title"
              margin="normal"
              name="title"
              onChange={handleTitleChange}
              value={state.title}
              variant="standard"
            />

            <FormControl fullWidth margin="normal" variant="standard">
              <InputLabel>Leave Type</InputLabel>
              <Select
                required
                label="Leave Type"
                name="leaveType"
                onChange={handleChange}
                value={state.leaveType}
              >
                {leaveTypes
                  ?.filter((type) => type.leaveType !== "overtime")
                  .map((type) => (
                    <MenuItem key={type._id} value={type.leaveType}>
                      {capitalizeFirstWord(type.title)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "5%",
              }}
            >
              <TextField
                required
                InputLabelProps={{
                  shrink: true,
                }}
                label="Start Date"
                margin="normal"
                name="startDate"
                onChange={handleStartDateChange}
                sx={{ width: "45%" }}
                type="date"
                value={state.startDate}
                variant="standard"
              />
              <Typography variant="h6">to</Typography>
              <TextField
                InputLabelProps={{
                  shrink: true,
                }}
                label="End Date"
                margin="normal"
                name="endDate"
                onChange={handleEndDateChange}
                sx={{ width: "45%" }}
                type="date"
                value={state.endDate}
                variant="standard"
              />
            </Box>

            <Box
              sx={{
                // border: "1px solid pink",
                maxHeight: "150px",
                overflowY: "scroll",
                display: "flex",
                flexDirection: "column",
                gap: "-1rem",
                "&::-webkit-scrollbar": {
                  width: "8px", // Adjust the width as needed
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "gray", // Adjust the color as needed
                  borderRadius: "6px", // Round the corners
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "lightgray", // Adjust the color as needed
                  borderRadius: "6px", // Round the corners
                },
              }}
            >
              {state.dailyDetails.map((dailyDetail, index) => (
                <Box
                  key={index}
                  sx={{
                    width: "80%",
                    marginBottom: "5px",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <TextField
                    disabled
                    label="Date"
                    margin="normal"
                    sx={{ width: "40%" }}
                    value={dailyDetail.day.toISOString().split("T")[0]}
                    variant="standard"
                  />
                  <FormControl
                    margin="normal"
                    sx={{ width: "40%" }}
                    variant="standard"
                  >
                    <InputLabel>Duration</InputLabel>
                    <Select
                      disabled={checkHoliday(dailyDetail.day.toISOString())}
                      label="Duration"
                      onChange={(e) =>
                        handleDailyDetailsChange(
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                      value={
                        checkHoliday(dailyDetail.day.toISOString())
                          ? "holiday"
                          : dailyDetail.duration
                      }
                    >
                      {checkHoliday(dailyDetail.day.toISOString()) && (
                        <MenuItem value="holiday">Holiday</MenuItem>
                      )}
                      <MenuItem value="fullday">Full Day</MenuItem>
                      <MenuItem value="halfday">Half Day</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              ))}
            </Box>

            <Box sx={{ widt: "50%", margin: "auto" }}>
              {state.daysDifference && (
                <TextField
                  disabled
                  fullWidth
                  label="Total Days"
                  margin="normal"
                  value={state.daysDifference}
                  variant="standard"
                />
              )}
            </Box>

            <Box>
              <TextField
                fullWidth
                multiline
                label="Reason"
                margin="normal"
                name="reason"
                onChange={handleChange}
                rows={7} // Starting number of rows
                sx={{ overflow: "auto" }} // Ensures a scrollbar appears if necessary
                value={state.reason}
                variant="standard"
              />
            </Box>

            <Box
              sx={{
                // border: "1px solid black",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "1%",
              }}
            >
              <Button
                sx={{
                  backgroundColor: theme?.secondaryColor,
                  paddingLeft: "2.5rem",
                  paddingRight: "2.5rem",
                  fontWeight: "bold",
                  color: "white",
                  ":hover": {
                    backgroundColor: theme?.secondaryColor,
                  },
                }}
                type="submit"
                variant="contained"
              >
                Submit
              </Button>
              <Button
                onClick={handleClose}
                sx={{
                  backgroundColor: theme?.secondaryColor,
                  paddingLeft: "2.5rem",
                  paddingRight: "2.5rem",
                  fontWeight: "bold",
                  color: "white",
                  ":hover": {
                    backgroundColor: theme?.secondaryColor,
                  },
                }}
                type="button"
                variant="contained"
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Box>

        <Box
          sx={{
            display: "flex",
            width: "35%",
          }}
        >
          <Box
            sx={{
              // border: "1px solid pink",
              padding: "16px",
              borderRadius: "4px",
              width: "100%",
            }}
          >
            <Box sx={{ border: "1px solid black" }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  margin: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px",
                }}
              >
                <strong>
                  As of{" "}
                  {new Date()
                    .toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    .split(" ")
                    .join("-")}
                </strong>
                <strong>Days(s)</strong>
              </Typography>
            </Box>

            <Box sx={{ border: "1px solid black" }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  margin: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                Available Balance: <span>{availableBalance}</span>
              </Typography>
            </Box>

            <Box sx={{ border: "1px solid black" }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  margin: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                Currently Booked : <span>{state.daysDifference || 0}</span>
              </Typography>
            </Box>

            <Box sx={{ border: "1px solid black" }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  margin: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                Balance After Booked:
                <span>{availableBalance - (state.daysDifference || 0)} </span>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <ConfirmationModal
        actionType="Apply"
        buttonLoading={buttonLoading}
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={handleConfirmation}
        open={isConfirmationModalOpen}
        theme={theme}
      />
    </>
  );
};

export default LeaveForm;
