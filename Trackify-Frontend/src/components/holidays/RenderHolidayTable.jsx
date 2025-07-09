import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONTS } from "##/src/utility/utility.js";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const RenderHolidayTable = ({
  holidays,
  handleEditClick,
  handleDeleteClick,
}) => {
  const tableBodyStyle = {
    fontFamily: FONTS.body,
    fontSize: "14px",
  };

  const tableHeadStyle = {
    fontFamily: FONTS.subheading,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#5a5a5a",
  };

  const filteredHolidays = holidays?.filter(
    (holiday) => holiday.status === undefined,
  );

  return (
    <>
      <TableContainer sx={{  scrollBehavior: "smooth" }}>
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
              <TableCell sx={tableHeadStyle}>Date</TableCell>
              <TableCell sx={tableHeadStyle}>Title</TableCell>
              <TableCell sx={tableHeadStyle}>Description</TableCell>
              <TableCell sx={tableHeadStyle}>Type</TableCell>
              <TableCell
                sx={{
                  ...tableHeadStyle,
                  textAlign: "center",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHolidays.length > 0 ? (
              filteredHolidays.map((holiday) => (
                <TableRow key={holiday._id}>
                  <TableCell sx={tableBodyStyle}>
                    {formatDate(holiday.date)}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>{holiday.title}</TableCell>
                  <TableCell sx={tableBodyStyle}>
                    {holiday.description}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>{holiday.type}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton onClick={() => handleEditClick(holiday)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(holiday)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  sx={{ textAlign: "center", backgroundColor: "#eee" }}
                >
                  <Typography sx={{ py: "20px" }}>No Holidays found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default RenderHolidayTable;
