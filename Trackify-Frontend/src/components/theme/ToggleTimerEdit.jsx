import { AuthContext } from "##/src/context/authcontext.js";
import { Box, CircularProgress, Switch } from "@mui/material";
import React, { useContext } from "react";

export default function ToggleTimerEdit({
  toggleLoading,
  handleEditToggle,
  isChecked,
}) {  const { loadingBarProgress } = useContext(AuthContext);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 16,
      }}
    >
      <span>Timer Editor:</span>
      {toggleLoading ? (
        <Box sx={{ paddingRight: "12px" }}>
          <CircularProgress color="inherit" size="1.8rem" />
        </Box>
      ) : (
        <Box>
          <Switch
            checked={!!isChecked}
            disabled={!!loadingBarProgress}
            onChange={handleEditToggle}
          />
        </Box>
      )}
    </Box>
  );
}
