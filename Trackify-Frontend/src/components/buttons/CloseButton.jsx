import React from "react";
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";

export const CloseButton = ({ onClose, theme, cs }) => {
  return (
    <IconButton
      onClick={onClose}
      sx={{
        position: "absolute",
        top: "10px",
        right: "20px",
        width: `${cs?.width ?? "40px"}`,
        height: `${cs?.height ?? "40px"}`,
        border: `1px solid ${theme?.secondaryColor}`,
        color: theme?.secondaryColor,
        ":hover": {
          color: "#F00",
          background: "none",
          borderColor: "#F00",
        },
      }}
    >
      <Close />
    </IconButton>
  );
};
