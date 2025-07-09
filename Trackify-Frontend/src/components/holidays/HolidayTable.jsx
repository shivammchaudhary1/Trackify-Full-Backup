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
import React from "react";
import { FONTS } from "##/src/utility/utility.js";

const HolidayTable = ({
  holidays,
  handleEditClick,
  handleDeleteClick,
  theme,
}) => {
  const tableBodyStyle = {
    fontFamily: FONTS.body,
    fontSize: "14px",
    textAlign: "center",
  };
  const tableHeadStyle = {
    fontFamily: FONTS.subheading,
    fontSize: "16px",
    fontWeight: "bold",
    color: theme.textColor,
    textAlign: "center",
  };

  return (
    <TableContainer>
      <Table>
        <TableHead sx={{ backgroundColor: theme.secondaryColor }}>
          <TableRow>
            <TableCell
              sx={{
                fontFamily: FONTS.subheading,
                fontSize: "16px",
                fontWeight: "bold",
                color: theme.textColor,
              }}
            >
              Date
            </TableCell>
            <TableCell sx={tableHeadStyle}>Title</TableCell>
            <TableCell sx={tableHeadStyle}>Description</TableCell>
            <TableCell sx={tableHeadStyle}>Type</TableCell>
            <TableCell sx={tableHeadStyle}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holidays.map((holiday) => (
            <TableRow key={holiday._id}>
              <TableCell sx={tableBodyStyle}>{holiday.date}</TableCell>
              <TableCell sx={tableBodyStyle}>{holiday.title}</TableCell>
              <TableCell sx={tableBodyStyle}>{holiday.description}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HolidayTable;
