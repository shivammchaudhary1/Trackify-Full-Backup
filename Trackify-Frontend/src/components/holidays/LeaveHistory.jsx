import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";

import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import { FONTS } from "##/src/utility/utility.js";

const LeaveRequestHistory = ({ leaveData, leaveTypes }) => {
  const tableBodyStyle = {
    fontFamily: FONTS.body,
    fontSize: "14px",
    textAlign: "center",
  };
  const tableHeadStyle = {
    fontFamily: FONTS.subheading,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#5a5a5a",
    textAlign: "center",
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <TableContainer sx={{ scrollBehavior: "smooth" }}>
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
              <TableCell
                sx={{
                  fontFamily: FONTS.subheading,
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#5a5a5a",
                  textAlign: "left",
                }}
              >
                Employee Name
              </TableCell>
              <TableCell sx={tableHeadStyle}>Leave Type</TableCell>
              <TableCell sx={tableHeadStyle}>Type</TableCell>
              <TableCell sx={tableHeadStyle}>Leave Period</TableCell>
              <TableCell sx={tableHeadStyle}>Days</TableCell>
              <TableCell sx={tableHeadStyle}>Date of Request</TableCell>
              <TableCell sx={tableHeadStyle}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveData.length > 0 ? (
              leaveData?.map((request) => {
                // Find the corresponding leave type in leaveTypes array
                const correspondingLeaveType = leaveTypes.find(
                  (type) => type.leaveType === request.type,
                );

                // Display "Paid" if found and it's true, otherwise "Unpaid"
                const paidStatus =
                  correspondingLeaveType && correspondingLeaveType.paid
                    ? "Paid"
                    : "Unpaid";

                return (
                  <TableRow key={request._id}>
                    <TableCell
                      sx={{
                        fontFamily: FONTS.body,
                        fontSize: "14px",
                        textAlign: "left",
                      }}
                    >
                      {request.user.name}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {capitalizeFirstWord(request.type)}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>{paidStatus}</TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {`${formatDate(request.startDate)} to ${formatDate(
                        request.endDate,
                      )}`}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {request.numberOfDays}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {capitalizeFirstWord(request.status)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7} // Adjust the colspan based on the number of columns
                  sx={{
                    textAlign: "center",
                    backgroundColor: "#eee",
                  }}
                >
                  <Typography sx={{ py: "20px" }}>No History Found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default LeaveRequestHistory;
