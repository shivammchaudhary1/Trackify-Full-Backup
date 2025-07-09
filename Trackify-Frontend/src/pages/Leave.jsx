import {
  Box,
  Button,
  CircularProgress,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getHoliday,
  getHolidayTypes,
  selectHolidayTypes,
  selectHolidays,
} from "##/src/app/holidaySlice.js";
import {
  getUsersLeave,
  getUsersLeaveBalance,
  selectUserLeaveBalance,
  selectUserLeaveData,
} from "##/src/app/leaveSlice.js";
import { selectCurrentWorkspace, selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import HistoryLeaveTable from "../components/leave/HistoryLeaveTable";
import LeaveBalanceBox from "../components/leave/LeaveBalanceBox";
import LeaveForm from "../components/leave/LeaveForm";
import UpcomingLeaveTable from "../components/leave/UpcomingLeaveTable";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";

const Leave = ({ setProgress }) => {
  const theme = useSelector(selectCurrentTheme);
  const [toggle, setToggle] = useState("upcoming");
  const [openLeaveForm, setOpenLeaveForm] = useState(false);
  const [componentLoading, setComponentLoading] = useState(false);
  const dispatchToRedux = useDispatch();
  const user = useSelector(selectMe);
  const workspaceId = useSelector(selectCurrentWorkspace);
  const userLeaveData = useSelector(selectUserLeaveData);
  const holidays = useSelector(selectHolidays);
  const userLeaveBalance = useSelector(selectUserLeaveBalance);
  const leaveTypes = useSelector(selectHolidayTypes);

  const { handleError } = useErrorHandler();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (
          userLeaveData.length === 0 ||
          userLeaveBalance.length === 0 ||
          leaveTypes.length === 0
        ) {
          if (user) {
            setProgress(30);
            setComponentLoading(true);
            await Promise.all([
              dispatchToRedux(getHolidayTypes({ userId: user._id })),
              dispatchToRedux(getUsersLeave({ userId: user._id })),
              dispatchToRedux(getHoliday()),
              dispatchToRedux(
                getUsersLeaveBalance({
                  userId: user._id,
                  workspaceId: workspaceId,
                })
              ),
            ]);
          }
        }
      } catch (error) {
        setProgress(100);
        handleError(`Failed to get Leave data, ${error}`);
      } finally {
        setProgress(100);
        setComponentLoading(false);
      }
    };

    fetchData();
  }, [workspaceId]);

  const calculateTotalLeaveBalance = (leaveBalance) => {
    return (
      parseFloat(
        leaveBalance
          ?.reduce((total, type) => total + parseFloat(type.value), 0)
          .toFixed(2)
      ) || 0
    );
  };

  const calculateTotalBookedBalance = (leaveBalance) => {
    return (
      parseFloat(
        leaveBalance
          ?.reduce((total, type) => total + parseFloat(type.consumed), 0)
          .toFixed(2)
      ) || 0
    );
  };

  const handleToggle = (event, newToggle) => {
    if (newToggle) {
      setToggle(newToggle);
    }
  };

  return (
    <>
      {componentLoading ? (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <Box sx={{ paddingTop: "20px" }}>
          {openLeaveForm ? (
            <>
              <LeaveForm
                setOpenLeaveForm={setOpenLeaveForm}
                setProgress={setProgress}
              />
            </>
          ) : (
            <Box>
              <Box sx={{ marginBottom: "15px", marginTop: "-2%" }}>
                <Container
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                  }}
                >
                  {userLeaveBalance?.leaveBalance?.map((leave) => {
                    const leaveType = leaveTypes.find(
                      (type) => type.leaveType === leave.type
                    );

                    if (leaveType && leaveType.isActive) {
                      return (
                        <LeaveBalanceBox
                          key={leave.type}
                          availableLeaves={leave.value}
                          consumedLeaves={leave.consumed}
                          theme={theme}
                          title={leave.title}
                        />
                      );
                    } else {
                      return null;
                    }
                  })}

                  <Box
                    sx={{
                      // border: "1px solid red",
                      width: "13%",
                      height: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "thin", fontSize: "16px" }}
                      variant="h6"
                    >
                      Total Leave:{"  "}
                      <strong style={{ fontSize: "20px" }}>
                        {calculateTotalLeaveBalance(
                          userLeaveBalance?.leaveBalance
                        )}
                      </strong>
                    </Typography>
                    <Typography
                      sx={{ fontWeight: "thin", fontSize: "16px" }}
                      variant="h6"
                    >
                      Total Booked:{"  "}
                      <strong style={{ fontSize: "20px" }}>
                        {calculateTotalBookedBalance(
                          userLeaveBalance?.leaveBalance
                        )}
                      </strong>
                    </Typography>
                    <Typography></Typography>
                    <Button
                      onClick={() => setOpenLeaveForm(true)}
                      sx={{
                        marginTop: "10px",
                        backgroundColor: theme?.secondaryColor,
                        color: "white",
                        ":hover": {
                          backgroundColor: theme?.secondaryColor,
                        },
                      }}
                      variant="contained"
                    >
                      Apply Leave
                    </Button>
                  </Box>
                </Container>
              </Box>
              <Box>
                <Container
                  maxWidth="100%"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                    marginBottom: "20px",
                  }}
                >
                  <ToggleButtonGroup
                    exclusive
                    onChange={handleToggle}
                    sx={{
                      height: "30px",
                    }}
                    value={toggle}
                  >
                    <ToggleButton value="upcoming">Upcoming </ToggleButton>
                    <ToggleButton value="applied">Applied</ToggleButton>
                  </ToggleButtonGroup>
                </Container>
                {toggle === "upcoming" && (
                  <UpcomingLeaveTable holidays={holidays} theme={theme} />
                )}
                {toggle === "applied" && (
                  <HistoryLeaveTable
                    leaveTypes={leaveTypes}
                    theme={theme}
                    userLeaveData={userLeaveData}
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export default Leave;
