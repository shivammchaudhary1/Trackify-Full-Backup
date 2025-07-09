import { Box, CircularProgress } from "@mui/material";
import React from "react";

const EntriesLoader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress color="inherit" />
    </Box>
  );
};

export default EntriesLoader;
