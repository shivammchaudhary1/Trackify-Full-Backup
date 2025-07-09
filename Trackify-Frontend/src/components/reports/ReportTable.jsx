import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";
import { FONTS } from "##/src/utility/utility.js";

const EntryRow = ({ element, type }) => {
  return (
    <TableRow>
      {type === 2 && (
        <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
          {element.projectDetails.description}
        </TableCell>
      )}
      {(type === 0 || type === 2) && (
        <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
          {element.projectDetails.name}
        </TableCell>
      )}
      {
        (type === 1 || type === 2) && (
          <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
            {element.developers.name }
          </TableCell>
        )
      }
      {
        (type === 1 || type === 2) && (
          <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
            {element.timeSpentbyDeveloper || "Total time Spent by Developer on all projects"}
          </TableCell>
        )
      }
      {
        type === 1 && (
          <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
            {element.estimatedTime || "-"}
          </TableCell>
        )
      }
      {type === 0 && (
        <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
          {element?.totalTimeSpent}
        </TableCell>
      )}
      {type === 0 && (
        <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
          {element?.projectDetails.estimatedHours}
        </TableCell>
      )}
      {type === 2 && (
        <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
          {element.status || "Status"}
        </TableCell>
      )}
      {type === 2 && (
        <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
          {element.status || "Created Date"}
        </TableCell>
      )}
    </TableRow>
  );
};

export default function ReportTable({ headings, theme, data, type }) {
  const tableHeadStyle = {
    fontFamily: FONTS.subheading,
    fontSize: "16px",
    fontWeight: "bold",
    color: theme?.textColor,
    textAlign: "center",
  };
  return (
    <Box>
      <Box sx={{ width: "100%" }}>
        <TableContainer component={Paper} sx={{ width: "94%", margin: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme?.secondaryColor }}>
                {headings?.map((heading, i) => {
                  return (
                    <TableCell key={i} sx={tableHeadStyle}>
                      {heading}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.length > 0 ? (
                data?.map((element) => {
                  return (
                    <EntryRow key={element._id} element={element} type={type} />
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center" }}>
                    No Data to show reports
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
