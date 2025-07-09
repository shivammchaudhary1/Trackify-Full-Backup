import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { memo, useState } from "react";
import { FONTS } from "##/src/utility/utility.js";
import { parseISO, differenceInSeconds } from "date-fns";

const tableHeadStyle = {
  fontFamily: FONTS.subheading,
  fontSize: "16px",
  fontWeight: "bold",
  color: "#5a5a5a",

  textAlign: "center",
};

const DataDisplay = ({ data }) => {
  const [open, setOpen] = useState({});

  const handleClick = (date) => {
    setOpen((prevOpen) => ({
      ...prevOpen,
      [date]: !prevOpen[date],
    }));
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationInSeconds = (end - start) / 1000;
    return durationInSeconds;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  function formatDurationByStartAndEndTime(startTime, endTime) {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const durationInSeconds = differenceInSeconds(end, start);
    return formatDuration(durationInSeconds || 0);
  }

  const totalHoursWorked = data.reduce((total, entry) => {
    return total + entry.totalDuration;
  }, 0);

  function formatLogOffTime(entry) {
    const endTime =
      entry.entries.length > 0 &&
      entry.entries[entry.entries.length - 1].endTime;
    if (endTime) {
      return new Date(endTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return "-";
    }
  }

  return (
    <Box height={["49vh", "50vh", "49vh", "54vh"]} overflow="scroll">
      <Typography
        gutterBottom
        sx={{ fontFamily: FONTS.body, fontSize: "1.4em" }}
        variant="p"
      >
        <strong>Total Hours: {formatDuration(totalHoursWorked)}</strong>
      </Typography>
      <TableContainer sx={{ marginTop: "20px" }}>
        <Table aria-label="a dense table" size="small">
          <TableHead>
            <TableRow
              sx={{
                borderTop: "1px solid #eee",
                borderBottom: "1px solid #eee",
                padding: "10px 0px",
              }}
            >
              <TableCell sx={{ ...tableHeadStyle, textAlign: "left" }}>
                Date
              </TableCell>
              <TableCell sx={{ ...tableHeadStyle, textAlign: "left" }}>
                Login
              </TableCell>
              <TableCell sx={{ ...tableHeadStyle, textAlign: "left" }}>
                Logoff
              </TableCell>
              {/* <TableCell sx={{ ...tableHeadStyle, textAlign: "left" }}>
                Screen Time
              </TableCell> */}
              <TableCell sx={{ ...tableHeadStyle, textAlign: "left" }}>
                Hours Worked
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {!!data.length &&
              data.map((entry) => (
                <React.Fragment key={entry._id.date}>
                  <TableRow
                    onClick={() => handleClick(entry._id.date)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell component="th" scope="row">
                      {entry._id.date}
                    </TableCell>
                    <TableCell>
                      {entry.entries.length > 0
                        ? entry.entries[0].startTime
                          ? new Date(
                              entry.entries[0].startTime
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "-"
                        : "-"}
                    </TableCell>
                    <TableCell>{formatLogOffTime(entry)}</TableCell>
                    <TableCell>{formatDuration(entry.totalDuration)}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleClick(entry._id.date)}
                        size="small"
                      >
                        {open[entry._id.date] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                    >
                      <Collapse
                        unmountOnExit
                        in={open[entry._id.date]}
                        timeout="auto"
                      >
                        <Box sx={{ margin: 1 }}>
                          <Table aria-label="entries" size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: "#eee" }}>
                                <TableCell
                                  sx={{ ...tableHeadStyle, textAlign: "left" }}
                                >
                                  Project
                                </TableCell>
                                <TableCell
                                  sx={{ ...tableHeadStyle, textAlign: "left" }}
                                >
                                  Title
                                </TableCell>
                                <TableCell
                                  sx={{ ...tableHeadStyle, textAlign: "left" }}
                                >
                                  Start Time
                                </TableCell>
                                <TableCell
                                  sx={{ ...tableHeadStyle, textAlign: "left" }}
                                >
                                  End Time
                                </TableCell>
                                <TableCell
                                  sx={{ ...tableHeadStyle, textAlign: "left" }}
                                >
                                  Duration
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {entry.entries.map((entry) => (
                                <TableRow key={entry._id}>
                                  <TableCell component="th" scope="row">
                                    {entry.projectDetails[0].name}
                                  </TableCell>
                                  <TableCell component="th" scope="row">
                                    {entry.title}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(
                                      entry.startTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(entry.endTime).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      }
                                    ) || "-"}
                                  </TableCell>
                                  <TableCell>
                                    {formatDurationByStartAndEndTime(
                                      entry.startTime,
                                      entry.endTime
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            {!data.length && (
              <TableRow>
                <TableCell
                  sx={{
                    textAlign: "center",
                    background: "#eee",
                    height: "70px",
                  }}
                  colSpan={5}
                >
                  No Reports found...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default memo(DataDisplay);
