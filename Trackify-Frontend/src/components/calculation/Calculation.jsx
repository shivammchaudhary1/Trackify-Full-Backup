import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectMe } from "##/src/app/profileSlice.js";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import { FONTS } from "##/src/utility/utility.js";
import {
  monthlyReport,
  savingMonthlyReport,
  selectMonthlyReport,
  selectShouldSaveMonthlyReport,
  setUpdateMonthlyReportData,
} from "../../app/reportSlice.js";
import ConfirmationDataSaveModal from "../calculationModal/ConfirmationDataSaveModal.jsx";
import EditOvertimeModal from "../calculationModal/EditOvertimeModal.jsx";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";

const Calculation = ({ theme }) => {
  const user = useSelector(selectMe);
  const monthlyDataState = useSelector(selectMonthlyReport);
  const shouldSaveMonthlyReport = useSelector(selectShouldSaveMonthlyReport);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [pageLoading, setPageLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const dispatchToRedux = useDispatch();
  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const years = [...Array(10).keys()].map((year) =>
    String(new Date().getFullYear() - year)
  );

  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const generateMonthlyReport = async () => {
    const numericMonth = parseInt(selectedMonth, 10);
    const numericYear = parseInt(selectedYear, 10);
    if (!numericMonth && !numericYear) {
      setNotification("Please select year and month", "warning");
      return;
    }
    try {
      setPageLoading(true);
      setButtonLoading(true);
      if (selectedMonth && selectedYear) {
        await dispatchToRedux(
          monthlyReport({
            userId: user._id,
            workspaceId: user.currentWorkspace,
            month: numericMonth,
            year: numericYear,
          })
        ).unwrap();
        setPageLoading(false);
        setButtonLoading(false);
        setNotification(
          "Data Reported, Success ! click confirm to add overtime balance or edit to modify",
          "success"
        );
      }
    } catch (error) {
      setPageLoading(false);
      setButtonLoading(false);
      handleError("Error in Generating Report.");
    }
  };

  const tableBodyStyle = {
    fontFamily: FONTS.body,
    fontSize: "14px",
    textAlign: "center",
  };
  const tableHeadStyle = {
    fontFamily: FONTS.subheading,
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "center",
  };

  const handleEditClick = (data) => {
    setSelectedUser(data);
    setEditModalOpen(true);
  };

  const handleUpdateOvertime = (updatedUserData) => {
    const userIndex = monthlyDataState.userMonthlyHours.findIndex(
      (user) => user.user === selectedUser.user
    );

    if (userIndex !== -1) {
      const updatedUserMonthlyHours = [...monthlyDataState.userMonthlyHours];
      updatedUserMonthlyHours[userIndex] = {
        ...updatedUserMonthlyHours[userIndex],
        overtime: updatedUserData.overtime,
        undertime: updatedUserData.undertime || {
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
      };

      dispatchToRedux(
        setUpdateMonthlyReportData({
          ...monthlyDataState,
          userMonthlyHours: updatedUserMonthlyHours,
        })
      );
    }
  };

  const getMonthName = (numericMonth) => {
    const monthObj = months.find((month) => month.value === numericMonth);
    return monthObj ? monthObj.label : "";
  };

  const handleConfirmClick = async () => {
    setConfirmationModalOpen(true);
  };
  const handleConfirmModalClose = () => {
    setConfirmationModalOpen(false);
  };

  const handleConfirmModalConfirm = async () => {
    const monthName = getMonthName(selectedMonth);

    if (!monthName && !selectedYear) {
      setNotification(
        "Please select month and year first, then generate the report, and click 'confirm' to save all in one go.",
        "warning"
      );
      return;
    }

    try {
      setButtonLoading(true);
      await dispatchToRedux(
        savingMonthlyReport({
          monthlyReportData: monthlyDataState,
          month: monthName,
          year: selectedYear,
          userId: user._id,
          workspaceId: user.currentWorkspace,
        })
      ).unwrap();

      setButtonLoading(false);
      setNotification(
        `Monthly report for ${monthName} ${selectedYear} saved successfully, and overtime balance added successfully!`,
        "success"
      );
    } catch (error) {
      setButtonLoading(false);
      handleError("Error saving monthly report.");
    } finally {
      setButtonLoading(false);
      setConfirmationModalOpen(false);
    }
  };

  const fixingNumberOfWorkingDays = (user) => {
    const totalHoursWorked = user.userWorkingHour.hours;

    if (totalHoursWorked > 0) {
      const days = totalHoursWorked / 8;

      // Round to the nearest quarter day
      const roundedDays = Math.round(days * 4) / 4;

      return roundedDays;
    } else {
      return 0;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        // height: "600px",
        marginTop: "-2rem",
      }}
    >
      <Box
        sx={{
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 1rem",
          gap: "10px",
        }}
      >
        <FormControl>
          <InputLabel>Month</InputLabel>
          <Select
            label="Month"
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{
              width: "140px",
              height: "40px",
            }}
            value={selectedMonth}
          >
            {months.map((month) => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Year</InputLabel>
          <Select
            label="Year"
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ width: "140px", height: "40px" }}
            value={selectedYear}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {pageLoading ? (
          <Button
            sx={{
              height: "40px",
              width: "140px",
              backgroundColor: theme?.secondaryColor,
              color: "white",
              ":hover": {
                backgroundColor: theme?.secondaryColor,
              },
            }}
            variant="contained"
          >
            <CircularProgress color="inherit" size="2rem" />
          </Button>
        ) : (
          <Button
            onClick={generateMonthlyReport}
            sx={{
              height: "40px",
              width: "140px",
              backgroundColor: theme?.secondaryColor,
              color: "white",
              ":hover": {
                backgroundColor: theme?.secondaryColor,
              },
            }}
            variant="contained"
          >
            Generate
          </Button>
        )}
      </Box>
      {pageLoading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {monthlyDataState && monthlyDataState.userMonthlyHours?.length > 0 && (
        <Box>
          <TableContainer >
            <Table
              stickyHeader
              aria-label="a dense table"
              size="small"
              sx={{
                "& .MuiTableCell-root": {
                  // padding: "10px 0px",
                },
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    borderTop: "1px solid #ddd",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <TableCell sx={tableHeadStyle}>Employee</TableCell>
                  <TableCell sx={tableHeadStyle}>Ideal Days</TableCell>
                  <TableCell sx={tableHeadStyle}>Ideal Hours</TableCell>
                  <TableCell sx={tableHeadStyle}>User Working Days</TableCell>
                  <TableCell sx={tableHeadStyle}>User Working Hours</TableCell>
                  <TableCell sx={tableHeadStyle}>Applied Leave</TableCell>
                  <TableCell sx={tableHeadStyle}>Paid Leave</TableCell>
                  <TableCell sx={tableHeadStyle}>Unpaid Leave</TableCell>
                  <TableCell sx={tableHeadStyle}>Overtime</TableCell>
                  <TableCell sx={tableHeadStyle}>Undertime</TableCell>
                  {/* <TableCell sx={tableHeadStyle}>Payable Hours</TableCell> */}
                  <TableCell sx={{ ...tableHeadStyle, textAlign: "right" }}>
                    Action
                  </TableCell>
                  <TableCell sx={{ ...tableHeadStyle, textAlign: "right" }}>
                    Edit
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {monthlyDataState.userMonthlyHours?.map((user) => (
                  <TableRow key={user.user}>
                    <TableCell sx={tableBodyStyle}>
                      {capitalizeFirstWord(user.user)}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {
                        monthlyDataState.idealMonthlyHours
                          .totalRequiredWorkingDays
                      }
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {
                        monthlyDataState.idealMonthlyHours
                          .totalRequiredWorkingHours
                      }
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {fixingNumberOfWorkingDays(user)}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {user.userWorkingHour.hours} :{" "}
                      {user.userWorkingHour.minutes} :{" "}
                      {user.userWorkingHour.seconds}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {user.totalLeaves}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>{user.paidLeaves}</TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {user.unpaidLeaves}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {user.overtime.hours}:{user.overtime.minutes}:
                      {user.overtime.seconds}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {user.undertime &&
                      (user.undertime.hours ||
                        user.undertime.minutes ||
                        user.undertime.seconds) !== undefined ? (
                        <span>
                          {user.undertime.hours}:{user.undertime.minutes}:
                          {user.undertime.seconds}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell sx={tableBodyStyle}></TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <IconButton
                        disabled={!shouldSaveMonthlyReport}
                        onClick={() => handleEditClick(user)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Middle Section */}

      {/* Bottom Section */}
      {monthlyDataState && monthlyDataState.userMonthlyHours?.length > 0 && (
        <Box
          sx={{
            border: "1px solid transparent",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 1rem",
            marginTop: "1rem",
          }}
        >
          {!shouldSaveMonthlyReport && (
            <Typography sx={{ paddingRight: "20px", color: "#800" }}>
              Report is already saved and further update is not allowed
            </Typography>
          )}
          <Button
            onClick={handleConfirmClick}
            disabled={!shouldSaveMonthlyReport}
            sx={{
              marginRight: "3rem",
              height: "40px",
              width: "140px",
              backgroundColor: theme?.secondaryColor,
              color: "white",
              ":hover": {
                backgroundColor: theme?.secondaryColor,
              },
            }}
            variant="contained"
          >
            Confirm
          </Button>
        </Box>
      )}
      {isEditModalOpen && (
        <EditOvertimeModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdateOvertime}
          overtimeData={selectedUser}
          theme={theme}
        />
      )}
      {isConfirmationModalOpen && (
        <ConfirmationDataSaveModal
          buttonLoading={buttonLoading}
          isOpen={isConfirmationModalOpen}
          onClose={handleConfirmModalClose}
          onConfirm={handleConfirmModalConfirm}
          theme={theme}
        />
      )}
    </Box>
  );
};

export default Calculation;
