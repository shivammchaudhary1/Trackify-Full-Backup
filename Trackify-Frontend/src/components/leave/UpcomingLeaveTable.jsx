import {
  Box,
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

const UpcomingLeaveTable = ({ holidays }) => {
  const getUpcomingHolidays = (holidays) => {
    const today = new Date();

    const upcomingHolidays = holidays
      .filter((holiday) => {
        const holidayDate = new Date(holiday.startDate || holiday.date);
        return holidayDate >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(a.startDate || a.date);
        const dateB = new Date(b.startDate || b.date);
        return dateA - dateB;
      });

    return upcomingHolidays;
  };

  const upcomingHolidays = getUpcomingHolidays(holidays);

  const filteredUpcomingHolidays = upcomingHolidays?.filter(
    (holiday) => holiday.status === "approved" || holiday.status === undefined,
  );

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

  return (
    <>
      <Box>
        <TableContainer sx={{ scrollBehavior: "smooth" }}>
          <Table
            stickyHeader
            aria-label="a dense table"
            size="small"
            sx={{
              "& .MuiTableCell-root": {
                padding: "10px 0px",
                paddingLeft: "20px",
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
                  Title
                </TableCell>
                <TableCell sx={tableHeadStyle}>Type</TableCell>
                <TableCell sx={tableHeadStyle}>Start Date</TableCell>
                <TableCell sx={tableHeadStyle}>End Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUpcomingHolidays?.length > 0 ? (
                filteredUpcomingHolidays.map((holiday) => (
                  <TableRow key={holiday._id}>
                    <TableCell
                      sx={{
                        fontFamily: FONTS.body,
                        fontSize: "14px",
                        color: "#5a5a5a",
                        textAlign: "left",
                      }}
                    >
                      {holiday.title}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {capitalizeFirstWord(holiday.type)}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {new Date(
                        holiday.date || holiday.startDate,
                      ).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {new Date(
                        holiday.endDate || holiday.date,
                      ).toLocaleDateString("en-GB")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    sx={{
                      textAlign: "center",
                      backgroundColor: "#eee",
                    }}
                  >
                    <Typography sx={{ py: "10px" }}>
                      No Upcoming Holiday found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default UpcomingLeaveTable;
