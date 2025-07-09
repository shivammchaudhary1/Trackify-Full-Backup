import { Box, Container, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getHolidayTypes,
  selectHolidayTypes,
} from "##/src/app/holidaySlice.js";
import { selectMe } from "##/src/app/profileSlice.js";
import { getLeaveDetails, selectLeaveData } from "../../app/leaveSlice";
import LeaveRequestHistory from "./LeaveHistory";
import LeaveRequests from "./LeaveRequests";
import UpdateLeaveBalance from "./UpdateLeaveBalance";
import LeaveHistoryLogs from "../leave/LeaveHistoryLogs";

const LeaveAdminPanel = ({ theme, setProgress }) => {
  const [value, setValue] = useState(0);
  const dispatchToRedux = useDispatch();
  const user = useSelector(selectMe);
  const leaveData = useSelector(selectLeaveData);
  const leaveTypes = useSelector(selectHolidayTypes);

  useEffect(() => {
    if (user) {
      dispatchToRedux(getLeaveDetails({ userId: user._id }));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      dispatchToRedux(getHolidayTypes({ userId: user._id }));
    }
  }, []);

  const pendingRequest = leaveData?.filter(
    (leave) => leave?.status === "pending"
  );

  const otherRequest = leaveData?.filter(
    (leave) => leave?.status !== "pending"
  );

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Box>
        <Container maxWidth="100%">
          <Tabs
            TabIndicatorProps={{
              sx: { backgroundColor: theme?.secondaryColor },
            }}
            onChange={handleChange}
            sx={{ mb: "20px", mt: "-20px", borderBottom: "1px solid #ddd" }}
            value={value}
          >
            <Tab
              label="Leave Requests"
              sx={{
                "&.Mui-selected": {
                  color: "#000",
                  borderLeft: "1px solid #eee",
                  borderRight: "1px solid #eee",
                },
                color: "#5a5a5a",
                fontSize: "16px",
                textTransform: "capitalize",
              }}
            />
            <Tab
              label="Requests History"
              sx={{
                "&.Mui-selected": {
                  color: "#000",
                  borderLeft: "1px solid #eee",
                  borderRight: "1px solid #eee",
                },
                color: "#5a5a5a",
                fontSize: "16px",
                textTransform: "capitalize",
              }}
            />
            <Tab
              label="History Logs"
              sx={{
                "&.Mui-selected": {
                  color: "#000",
                  borderLeft: "1px solid #eee",
                  borderRight: "1px solid #eee",
                },
                color: "#5a5a5a",
                fontSize: "16px",
                textTransform: "capitalize",
              }}
            />
            {/* 25 oct changes here */}
            <Tab
              label="Update Balance"
              sx={{
                "&.Mui-selected": {
                  color: "#000",
                  borderLeft: "1px solid #eee",
                  borderRight: "1px solid #eee",
                },
                color: "#5a5a5a",
                fontSize: "16px",
                textTransform: "capitalize",
              }}
            />
          </Tabs>
          {value === 0 && (
            <LeaveRequests
              leaveData={pendingRequest}
              leaveTypes={leaveTypes}
              setProgress={setProgress}
            />
          )}
          {value === 1 && (
            <LeaveRequestHistory
              leaveData={otherRequest}
              leaveTypes={leaveTypes}
            />
          )}
          {value === 2 && <LeaveHistoryLogs />}
          {value === 3 && <UpdateLeaveBalance setProgress={setProgress} />}
        </Container>
      </Box>
    </>
  );
};

export default LeaveAdminPanel;
