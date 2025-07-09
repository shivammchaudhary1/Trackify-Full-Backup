import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Grid2 as Grid,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Box,
  Select,
  MenuItem,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  selectCurrentTheme,
  selectCurrentWorkspace,
} from "##/src/app/profileSlice";
import { FONTS } from "##/src/utility/utility.js";
import { useDispatch } from "react-redux";
import {
  retrieveLeaveHistoryData,
  selectLeaveHistoryLogs,
} from "##/src/app/leaveSlice.js";

const LEAVE_ACTION = {
  APPLIED: "applied",
  DELETED: "deleted",
  APPROVED: "approved",
  REJECTED: "rejected",
  ADDED: "addedByAdmin",
  UPDATED_BY_ADMIN: "updatedByAdmin",
};

const HISTORY_ACTION_LABEL = {
  [LEAVE_ACTION.APPLIED]: "New leave request",
  [LEAVE_ACTION.APPROVED]: "Leave request approved",
  [LEAVE_ACTION.REJECTED]: "Leave request rejected",
  [LEAVE_ACTION.DELETED]: "Leave deleted by user",
  [LEAVE_ACTION.ADDED]: "Leave balance added by admin",
  [LEAVE_ACTION.UPDATED_BY_ADMIN]: "Leave balance updated",
};

const tableHeadStyle = {
  fontFamily: FONTS.subheading,
  fontSize: "16px",
  fontWeight: "bold",
  color: "#5a5a5a",
  textAlign: "center",
};
const LeaveHistoryLogs = () => {
  const workspaceId = useSelector(selectCurrentWorkspace);
  const theme = useTheme();
  const systemTheme = useSelector(selectCurrentTheme);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [nameFilters, setNameFilter] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const dispatchToRedux = useDispatch();
  const logs = useSelector(selectLeaveHistoryLogs);

  useEffect(() => {
    async function handleGetData() {
      try {
        await dispatchToRedux(
          retrieveLeaveHistoryData({ workspaceId })
        ).unwrap();
      } catch (error) {
        console.error(error);
      }
    }
    if (!logs.length && workspaceId) {
      handleGetData();
    }
  }, [workspaceId]);

  useEffect(() => {
    setFilteredLogs(logs);
    const filtered = [
      ...new Map(logs.map((log) => [log.user._id, log.user])).values(),
    ];
    setNameFilter(filtered);
  }, [logs]);

  const handleUserChange = (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);

    if (userId) {
      const filtered = logs.filter((log) => log.user._id === userId);
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(logs);
    }
  };

  const renderDescription = (log) => {
    const startTimeString = new Date(log.startDate).toLocaleDateString();
    const endTimeString = new Date(log.endDate).toLocaleDateString();

    switch (log.action) {
      case LEAVE_ACTION.APPLIED:
        return (
          <>
            {/* <Typography variant="body1">
              <strong>Employee:</strong> {log.user.name}
            </Typography> */}
            <Typography variant="body1">
              <strong>Type:</strong> {log.leaveType}, <strong>Period:</strong>{" "}
              {startTimeString} to {endTimeString}
            </Typography>
            <Typography variant="body1">
              <strong>Previous Balance:</strong> {log.previousLeaveCount},{" "}
              <strong>Booked :</strong> {log.leaveChangesCount},
              <strong>Remaining Balance:</strong> {log.newLeaveCount}
            </Typography>
          </>
        );
      case LEAVE_ACTION.DELETED:
        return (
          <>
            <Typography variant="body1">
              <strong>Type:</strong> {log.leaveType}, <strong>Period:</strong>{" "}
              {startTimeString} to {endTimeString}
            </Typography>
            <Typography variant="body1">
              <strong>Previous Balance:</strong> {log.previousLeaveCount},{" "}
              <strong>Balance reverted:</strong> {log.leaveChangesCount},{" "}
              <strong>Updated Balance:</strong> {log.newLeaveCount}
            </Typography>
          </>
        );
      case LEAVE_ACTION.APPROVED:
        return (
          <>
            <Typography variant="body1">
              <strong>Type:</strong> {log.leaveType}, <strong>Period:</strong>{" "}
              {startTimeString} to {endTimeString}
            </Typography>
            <Typography variant="body1">
              <strong>Remaining Balance:</strong> {log.newLeaveCount}
            </Typography>
          </>
        );
      case LEAVE_ACTION.REJECTED:
        return (
          <>
            <Typography variant="body1">
              <strong>Type:</strong> {log.leaveType}, <strong>Period:</strong>{" "}
              {startTimeString} to {endTimeString}
            </Typography>
            <Typography variant="body1">
              <strong>Previous Balance:</strong> {log.previousLeaveCount},
              <strong>Balance reverted:</strong> {log.leaveChangesCount},
              <strong>Updated Balance:</strong> {log.newLeaveCount}
            </Typography>
            <Typography variant="body1">
              <strong>Reason:</strong> {log.additionalInfo}
            </Typography>
          </>
        );
      case LEAVE_ACTION.ADDED:
        return (
          <>
            <Typography variant="body1">
              <strong>Type:</strong> {log.leaveType}, <strong>Added on:</strong>{" "}
              {new Date(log.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              <strong>Previous balance:</strong> {log.previousLeaveCount},{" "}
              <strong>Balance added:</strong> {log.leaveChangesCount},{" "}
              <strong>Updated balance:</strong> {log.newLeaveCount}
            </Typography>
            <Typography variant="body1">
              <strong>Info:</strong>{" "}
              {log.author
                ? `Leave added by ${log.author.name}`
                : "Leave added by Trackify.ai"}
            </Typography>
          </>
        );
      case LEAVE_ACTION.UPDATED_BY_ADMIN:
        return (
          <>
            <Typography variant="body1">
              <strong>Type:</strong> {log.leaveType},{" "}
              <strong>Updated on:</strong>{" "}
              {new Date(log.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              <strong>Previous balance:</strong> {log.previousLeaveCount},{" "}
              <strong>
                {log.previousLeaveCount > log.newLeaveCount
                  ? "Leave Reduced"
                  : "Leave Added"}
              </strong>{" "}
              {Math.abs(log.newLeaveCount - log.previousLeaveCount)},{" "}
              <strong>Updated balance:</strong> {log.newLeaveCount}
            </Typography>
            <Typography variant="body1">
              <strong>Info:</strong>{" "}
              {log.author
                ? log.additionalInfo
                  ? log.additionalInfo + `, by ${log.author.name}`
                  : `Leave balance updated by ${log.author.name}`
                : "Leave added by Trackify.ai"}
            </Typography>
          </>
        );
      default:
        return "";
    }
  };

  return (
    logs && (
      <>
        <Box
          width={"100%"}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            borderBottom: `1px solid ${systemTheme.secondaryColor}`,
            borderTop: `1px solid ${systemTheme.secondaryColor}`,
            py: "5px",
          }}
        >
          <Select
            value={selectedUserId}
            onChange={handleUserChange}
            displayEmpty
            sx={{ height: "45px" }}
            variant="outlined"
          >
            <MenuItem value="">
              <em>All Users</em>
            </MenuItem>
            {nameFilters.map((userLog) => (
              <MenuItem key={userLog._id} value={userLog._id}>
                {userLog.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Grid
          container
          spacing={3}
          overflow={"scroll"}
          
          sx={{
            "::-webkit-scrollbar": {
              width: "10px",
              scrollBehavior: "smooth"
            },
            // "::-webkit-scrollbar-track": {
            //   background: "#f1f1f1",
            // },
            "::-webkit-scrollbar-thumb": {
              background: systemTheme.secondaryColor,
              borderRadius: "10px",
            },
            "::-webkit-scrollbar-thumb:hover": {
              background: systemTheme.primaryColor,
            },
          }}
        >
          <Grid size={12}>
            <TableContainer>
              {/* {!isMobile ? ( */}
              <Table
                stickyHeader
                aria-label="a dense table"
                size="small"
                sx={{
                  "& .MuiTableCell-root": {
                    padding: "10px 0px",
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
                    <TableCell sx={tableHeadStyle}>
                      <strong>Date</strong>
                    </TableCell>
                    <TableCell sx={tableHeadStyle}>
                      <strong>Name</strong>
                    </TableCell>
                    <TableCell sx={tableHeadStyle}>
                      <strong>Email</strong>
                    </TableCell>
                    <TableCell sx={tableHeadStyle}>
                      <strong>Action</strong>
                    </TableCell>
                    <TableCell sx={tableHeadStyle}>
                      <strong>Description</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <Typography>
                          {new Date(log.createdAt).toDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{log.user.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{log.user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {HISTORY_ACTION_LABEL[log.action]}
                        </Typography>
                      </TableCell>
                      <TableCell>{renderDescription(log)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* // ) :
              // (
              // logs.map((log) => (
              //   <Card key={log._id} sx={{ marginBottom: 2, boxShadow: "none" }}>
              //     <CardContent>{renderDescription(log)}</CardContent>
              //   </Card>
              // )) */}
              {/* )} */}
            </TableContainer>
          </Grid>
        </Grid>
      </>
    )
  );
};

export default LeaveHistoryLogs;
