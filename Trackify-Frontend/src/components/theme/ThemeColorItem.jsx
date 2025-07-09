import { changeTheme } from "##/src/app/profileSlice.js";
import { Box, CircularProgress, Radio } from "@mui/material";
import React, { useTransition } from "react";
import { useDispatch } from "react-redux";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import { useContext } from "react";
import { AuthContext } from "##/src/context/authcontext.js";

function ThemeColorItem({ theme, currentThemeId, isDisabled }) {
  const [isLoading, startTransition] = useTransition();
  const { setLoadingBarProgress } = useContext(AuthContext);
  const dispatchToRedux = useDispatch();
  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const handleThemeChange = async (themeId) => {
    if (isLoading || isDisabled) {
      return;
    }
    setLoadingBarProgress(30);
    startTransition(async () => {
      try {        await dispatchToRedux(changeTheme({ themeId })).unwrap();
        setNotification("Theme changed successfully", "success");
        setLoadingBarProgress(100);
      } catch (error) {
        handleError("Failed to change theme please try again");
        setLoadingBarProgress(100);
      }
    });
  };

  return (
    <Box
      key={theme.themeId}
      onClick={() => handleThemeChange(theme.themeId)}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "2px",
        cursor: "pointer",
        hover: { backgroundColor: theme?.primaryColor },
      }}
    >
      {isLoading ? (
        <Box
          sx={{
            padding: "0.6rem",
            marginRight: "5px",
          }}
        >
          <CircularProgress color="inherit" size="1rem" />
        </Box>
      ) : (
        <Box>
          <Radio
            checked={theme?.themeId === currentThemeId}
            name="theme"
            sx={{ borderColor: theme?.textColor }}
            type="radio"
            value={theme?.themeId}
          />
        </Box>
      )}
      <Box
        sx={{
          backgroundColor: theme?.backgroundColor,
          width: "100%",
          height: "30px",
          borderRadius: "5px",
        }}
      ></Box>
    </Box>
  );
}

export default ThemeColorItem;
