import { Button } from "@mui/material";
import React from "react";

export const SaveButton = ({ onSave, theme, width = "96%", disabled }) => {
  return (
    <Button
      onClick={onSave}
      disabled={disabled}
      sx={{
        backgroundColor: theme?.secondaryColor,
        width: width,
        fontSize: "16px",
        ":hover": {
          backgroundColor: theme?.secondaryColor,
        },
      }}
      variant="contained"
    >
      Submit
    </Button>
  );
};
