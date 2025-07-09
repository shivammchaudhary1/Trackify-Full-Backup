import { Button, CircularProgress } from "@mui/material";
import React from "react";

export const LoadingButton = ({ theme }) => {
  return (
    <Button
      sx={{
        backgroundColor: theme?.secondaryColor,
        width: "96%",
        fontSize: "16px",
        ":hover": {
          backgroundColor: theme?.secondaryColor,
        },
      }}
      variant="contained"
    >
      <CircularProgress color="inherit" size="1.8rem" />
    </Button>
  );
};
